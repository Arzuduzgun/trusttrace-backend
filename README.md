# TrustTrace — Backend

Müşteri hizmetleri için gerçek zamanlı, **denetlenebilir ve izlenebilir** chat platformunun API ve WebSocket sunucusu.
Müşteriler temsilcilerle birebir veya ürün odalarında yazışır; her mesaj içerik taramasından geçer, ihlaller değiştirilemez bir deftere yazılır ve her mesajın yolculuğu tek bir trace ID ile izlenir.

|                                        |                                                   |
| -------------------------------------- | ------------------------------------------------- |
| Canlı uygulama                         | https://56-228-77-224.sslip.io                    |
| API dokümantasyonu (Swagger)           | https://56-228-77-224.sslip.io/docs               |
| Trace görselleştirme (Jaeger, şifreli) | https://jaeger.56-228-77-224.sslip.io             |
| Frontend reposu                        | https://github.com/Arzuduzgun/trusttrace-frontend |

## Teknolojiler

NestJS 12 · TypeScript · PostgreSQL 16 + Drizzle ORM · Redis 7 · Socket.io · pino (yapılandırılmış log) · OpenTelemetry + Jaeger · Swagger · Docker Compose · Caddy · GitHub Actions · AWS EC2

## Mimari

```mermaid
flowchart LR
  B[Tarayıcı] -->|HTTPS| C[Caddy<br/>otomatik TLS]
  C -->|/api, /socket.io, /docs, /health| BE[NestJS backend]
  C -->|diğer tüm yollar| FE[Next.js frontend]
  FE -->|sunucu tarafı fetch| BE
  BE --> PG[(PostgreSQL)]
  BE --> R[(Redis)]
  BE -->|OTLP| J[Jaeger]
```

- **Katmanlar:** controller → service → repository. Servisler veritabanına doğrudan erişemez (oxlint kuralı ile zorlanır).
- **Kimlik doğrulama:** Kısa ömürlü access JWT + rotasyonlu refresh token (veritabanında SHA-256 hash). Refresh token tekrar kullanımı tespit edilirse oturum ailesi iptal edilir. Login denemeleri Redis ile sınırlanır.
- **Gerçek zamanlı iletişim:** WebSocket bağlantısı 60 saniyelik tek kullanımlık bir _ws-ticket_ ile açılır. Kanallar: `room:<id>`, `room:<id>:staff`, `user:<id>`.
- **Mesaj yaşam döngüsü:** `PENDING` olarak kaydedilir → içerik taraması → `DELIVERED / FLAGGED / BLOCKED` olarak sonuçlandırılır (ihlal kaydıyla aynı transaction içinde) → odaya yayınlanır. Hata olursa `FAILED` olur ve aynı `clientMessageId` ile güvenle tekrar denenebilir.
- **Temsilci atama:** Önce çevrimiçi olan, sonra en az aktif odası olan temsilci seçilir. Eşzamanlı atamalar `pg_advisory_xact_lock` ile sıraya sokulur.
- **Varlık bilgisi (presence):** Redis set'leri ve 20 saniyelik heartbeat.
- **Hata formatı:** Tüm hatalar `{ success: false, error: { code, message } }` biçiminde döner. Kodlar merkezi bir katalogdadır.

## Seçilen challenge'lar

### #1 Structured Logging & Distributed Tracing

Her mesaj gönderimi bir **OpenTelemetry trace**'i başlatır. Aşamalar ayrı span'lerdir:

```
chat.message
├── message.persist     (PENDING kaydı)
├── moderation.scan     (içerik taraması)
├── message.finalize    (son durum + ihlal defteri)
└── message.broadcast   (odaya iletim)
```

- Tüm pino log satırlarına otomatik olarak `traceId` eklenir (`mixin`). Aşama logları `stage: persisted | scanned | finalized | failed` alanını taşır.
- İhlal defterine yazılan kayıtlar aynı `traceId`'yi saklar; admin panelinde görünür.
- Hata durumunda istemciye giden `message:failed` olayı da `traceId` içerir.
- Span'ler OTLP ile Jaeger'a gönderilir; Jaeger'da trace ID ile arama ve zaman çizelgesi görüntüleme yapılır.
- Mesaj içeriği span'lere yazılmaz, sadece ID'ler yazılır (gizlilik).

**Canlı hata senaryosu:** `CHAOS_FAIL_TOKEN` tanımlıyken bu kelimeyi içeren bir mesaj gönderildiğinde tarama aşaması kasıtlı olarak hata verir.

1. Müşteri olarak `__fail__ deneme` yaz → mesaj başarısız görünür.
2. Loglarda `"stage":"failed"` satırındaki `traceId`'yi al (`docker compose logs backend | grep '"stage"'`).
3. Jaeger'da _Lookup by Trace ID_ → `moderation.scan` span'i kırmızıdır ve hata mesajını içerir.

**Neden bu yaklaşım?** Mesajlar HTTP değil WebSocket üzerinden geldiği için otomatik HTTP enstrümantasyonu akışı kapsamıyordu; aşamalar elle span olarak tanımlandı. Yerleşik ve açık bir standart olduğu için OpenTelemetry seçildi; ileride Jaeger yerine AWS X-Ray veya Grafana Tempo'ya kod değişmeden geçilebilir.

### #2 Immutable Audit Log

`moderation_events` tablosu **sadece ekleme yapılabilen** bir defterdir.

- **Veritabanı trigger'ı** `UPDATE`, `DELETE` ve `TRUNCATE` işlemlerini reddeder (yönetici dahil).
- **Ayrı veritabanı rolü:** Uygulama `trusttrace_app` kullanıcısıyla bağlanır; bu rolün tablodaki `UPDATE / DELETE / TRUNCATE` yetkisi `REVOKE` ile alınmıştır (`deploy/grants.sql`). Böylece koruma iki katmanlıdır.
- **Düzeltmeler yeni kayıttır:** Bir cezanın kaldırılması `SANCTION_REVOKED` kaydı olarak eklenir ve `refersToEventId` ile orijinal kayda bağlanır.
- **Hash zinciri:** Her kayıt bir önceki kaydın hash'ini (`prev_hash`) içerir; içerik SHA-256 ile hash'lenir. Eşzamanlı eklemeler advisory lock ile sıraya alınır. `GET /api/v1/admin/moderation-events/verify` zinciri baştan sona doğrular.
- **Olay türleri:** `VIOLATION_DETECTED`, `SANCTION_IMPOSED`, `SANCTION_REVOKED`, `USER_REPORTED`.
- Admin panelinde defter türe, kullanıcıya ve odaya göre filtrelenebilir.

## Kurulum (yerel)

Gerekenler: Node.js 22, pnpm 9, Docker Desktop.

```bash
git clone https://github.com/Arzuduzgun/trusttrace-backend.git
cd trusttrace-backend
pnpm install
cp .env.example .env          # değerleri doldur (aşağıdaki tablo)
docker compose up -d          # postgres, redis, jaeger
pnpm db:migrate
pnpm db:seed
pnpm start:dev
```

- API: http://localhost:4000/api/v1
- Swagger: http://localhost:4000/docs
- Jaeger: http://localhost:16686

**Demo hesaplar** (seed ile gelir, şifre `Demo12345`):

| Rol      | E-posta                                    |
| -------- | ------------------------------------------ |
| Admin    | admin@trusttrace.dev                       |
| Temsilci | ayse@trusttrace.dev, mehmet@trusttrace.dev |
| Müşteri  | ali@trusttrace.dev, zeynep@trusttrace.dev  |

## Ortam değişkenleri

| Değişken                      | Zorunlu | Örnek                                                        | Açıklama                                                          |
| ----------------------------- | ------- | ------------------------------------------------------------ | ----------------------------------------------------------------- |
| `NODE_ENV`                    | Hayır   | `development`                                                | `development`, `test` veya `production`                           |
| `PORT`                        | Hayır   | `4000`                                                       | HTTP portu                                                        |
| `LOG_LEVEL`                   | Hayır   | `info`                                                       | `debug`, `info`, `warn`, `error`                                  |
| `DATABASE_URL`                | Evet    | `postgres://trusttrace:trusttrace@localhost:5432/trusttrace` | PostgreSQL bağlantısı                                             |
| `REDIS_URL`                   | Evet    | `redis://localhost:6379`                                     | Redis bağlantısı                                                  |
| `JWT_ACCESS_SECRET`           | Evet    | en az 32 karakter                                            | Access token imza anahtarı                                        |
| `JWT_ACCESS_TTL_SECONDS`      | Hayır   | `900`                                                        | Access token ömrü                                                 |
| `JWT_REFRESH_TTL_DAYS`        | Hayır   | `7`                                                          | Refresh token ömrü                                                |
| `WS_TICKET_SECRET`            | Evet    | en az 32 karakter                                            | WebSocket bilet imza anahtarı                                     |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Hayır   | `http://127.0.0.1:4318`                                      | Tanımlıysa span'ler Jaeger'a gönderilir                           |
| `CHAOS_FAIL_TOKEN`            | Hayır   | `__fail__`                                                   | Tanımlıysa bu kelimeyi içeren mesajlar kasıtlı hata üretir (demo) |

## Komutlar

| Komut              | Ne yapar                                                      |
| ------------------ | ------------------------------------------------------------- |
| `pnpm start:dev`   | Geliştirme sunucusu (izleme modu)                             |
| `pnpm build`       | Derleme                                                       |
| `pnpm lint:check`  | oxlint + format kontrolü + TypeScript tip kontrolü            |
| `pnpm fmt`         | Kodu formatlar                                                |
| `pnpm db:generate` | Şemadan yeni migration üretir                                 |
| `pnpm db:migrate`  | Migration'ları uygular                                        |
| `pnpm db:seed`     | Demo verileri ekler                                           |
| `pnpm db:studio`   | Drizzle Studio                                                |
| `pnpm gen:openapi` | `docs/api/openapi.json` dosyasını günceller (backend açıkken) |
| `pnpm test:race`   | Eşzamanlı temsilci atama testi                                |

## Proje yapısı

```
src/
  common/      hata yapısı, guard'lar, interceptor, logging, tracing
  config/      ortam değişkeni doğrulaması (zod)
  database/    Drizzle şemaları ve bağlantı
  modules/     auth, users, rooms, chat, moderation, moderation-events,
               sanctions, notifications, products, health
  realtime/    modüller arası WebSocket bildirim servisi
  redis/       rate limiter, presence
deploy/        production compose, Caddyfile, grants.sql, deploy.sh
drizzle/       migration dosyaları
```

## Deploy (AWS)

Tek bir **EC2** sunucusunda (Ubuntu 24.04, `eu-north-1`) Docker Compose ile çalışır. Dosyalar `deploy/` klasöründedir.

- **Caddy** 80/443 portlarını dinler, Let's Encrypt sertifikasını otomatik alır ve istekleri yola göre backend'e veya frontend'e yönlendirir. Böylece her şey tek alan adından açılır: CORS gerekmez ve `secure` cookie'ler çalışır.
- PostgreSQL ve Redis dışarıya port açmaz; sadece iç Docker ağından erişilir.
- Gizli değerler sunucuda `~/trusttrace/secrets.env` dosyasında tutulur, repoya girmez.
- Jaeger arayüzü Caddy üzerinden HTTP Basic Auth ile korunur.
- AWS App Runner WebSocket desteklemediği için kullanılmadı. Gerçek bir production ortamında RDS (PostgreSQL), ElastiCache (Redis), ECS ve Application Load Balancer tercih edilirdi.

## CI/CD

GitHub Actions (`.github/workflows/ci-cd.yml`):

1. **CI** (her push ve pull request): `pnpm install --frozen-lockfile` → `pnpm lint:check` → `pnpm build`.
2. **CD** (sadece `main` dalına push ve CI başarılıysa): SSH ile EC2'ye bağlanır ve `deploy/deploy.sh` betiğini çalıştırır. Betik iki repoyu günceller, imajları derler, migration'ları uygular ve konteynerleri yeniler.

SSH anahtarı ve sunucu adresi GitHub Secrets'ta (`EC2_SSH_KEY`, `EC2_HOST`) saklanır.
