# TrustTrace — İlerleme Notları

## Bitenler

- 26 Ekim: repolar, oxlint/oxfmt/husky/commitlint, docker-compose (Postgres + Redis)
- 27 Ekim: config modülü (Zod ile .env doğrulama), guard scriptleri yerine oxlint kuralları,
  database modülü (Drizzle), users + refresh_tokens tabloları, ilk migration
- hata ve cevap zarfı, pino ile request id, health modülü

## Kararlar

- Branch yok, doğrudan main; güvence: husky hook'ları + CI
- Veritabanı: sadece Postgres + Redis (Mongo yok)
- Challenge'lar: #2 değişmez defter, #1 loglama/tracing, #3 otomatik moderasyon
- Ön sunum (2 Kasım) lokalde, deploy 3 Kasım

## Sıradaki adım

- users modülü ve auth (register, login, refresh, logout, roller, global guard)

## Sorunlar / yarım kalanlar

-
