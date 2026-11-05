export const DEMO_PASSWORD = 'Demo12345';

export const SEED_USERS = [
  { email: 'admin@trusttrace.dev', displayName: 'Admin', role: 'ADMIN' },
  { email: 'ayse@trusttrace.dev', displayName: 'Ayşe (Temsilci)', role: 'AGENT' },
  { email: 'mehmet@trusttrace.dev', displayName: 'Mehmet (Temsilci)', role: 'AGENT' },
  { email: 'ali@trusttrace.dev', displayName: 'Ali', role: 'CUSTOMER' },
  { email: 'zeynep@trusttrace.dev', displayName: 'Zeynep', role: 'CUSTOMER' },
] as const;

export const SEED_RULES = [
  { pattern: 'aptal', action: 'BLOCK' },
  { pattern: 'gerizekalı', action: 'BLOCK' },
  { pattern: 'seni bulacağım', action: 'BLOCK' },
  { pattern: 'adresini biliyorum', action: 'BLOCK' },
  { pattern: 'salak', action: 'FLAG' },
  { pattern: 'dolandırıcı', action: 'FLAG' },
] as const;

export const SEED_PRODUCTS = [
  {
    name: 'Kablosuz Kulaklık',
    description: 'Aktif gürültü engelleme, 30 saat pil ömrü, Bluetooth 5.3',
    imageUrl: '/products/kulaklik.jpeg',
    priceCents: 249990,
    agentEmail: 'ayse@trusttrace.dev',
    customerEmails: ['ali@trusttrace.dev', 'zeynep@trusttrace.dev'],
  },
  {
    name: 'Akıllı Saat',
    description: 'Nabız ve uyku takibi, 7 gün pil, suya dayanıklı',
    imageUrl: '/products/akilli-saat.jpeg',
    priceCents: 329900,
    agentEmail: 'mehmet@trusttrace.dev',
    customerEmails: [],
  },
  {
    name: 'Dizüstü Bilgisayar',
    description: '14 inç ekran, 16 GB RAM, 512 GB SSD',
    imageUrl: '/products/laptop.jpeg',
    priceCents: 3299900,
    agentEmail: 'ayse@trusttrace.dev',
    customerEmails: [],
  },
  {
    name: 'Kahve Makinesi',
    description: 'Espresso ve süt köpürtücü, 15 bar basınç',
    imageUrl: '/products/kahve-makinesi.jpeg',
    priceCents: 574950,
    agentEmail: 'mehmet@trusttrace.dev',
    customerEmails: [],
  },
  {
    name: 'Robot Süpürge',
    description: 'Lazer navigasyon, paspas özelliği, otomatik boşaltma istasyonu',
    imageUrl: '/products/robot-supurge.jpeg',
    priceCents: 1249900,
    agentEmail: 'ayse@trusttrace.dev',
    customerEmails: [],
  },
  {
    name: 'Airfryer',
    description: '6 litre hazne, yağsız pişirme, 8 hazır program',
    imageUrl: '/products/airfryer.jpeg',
    priceCents: 379990,
    agentEmail: 'mehmet@trusttrace.dev',
    customerEmails: [],
  },
  {
    name: 'Kablosuz Mouse',
    description: 'Sessiz tıklama, 2.4 GHz alıcı, 18 ay pil ömrü',
    imageUrl: '/products/mouse.jpeg',
    priceCents: 49990,
    agentEmail: 'ayse@trusttrace.dev',
    customerEmails: [],
  },
  {
    name: 'Akıllı Telefon',
    description: '6,5 inç AMOLED ekran, 256 GB depolama, 50 MP kamera',
    imageUrl: '/products/telefon.jpeg',
    priceCents: 2499900,
    agentEmail: 'mehmet@trusttrace.dev',
    customerEmails: [],
  },
  {
    name: 'Saç Şekillendirici',
    description: 'Çok başlıklı set, iyonik teknoloji, ısı koruması',
    imageUrl: '/products/sac-sekillendirme.jpeg',
    priceCents: 429900,
    agentEmail: 'ayse@trusttrace.dev',
    customerEmails: [],
  },
] as const;

export const SEED_DIRECT_ROOMS = [
  {
    name: 'Ali – Ayşe (Temsilci)',
    customerEmail: 'ali@trusttrace.dev',
    agentEmail: 'ayse@trusttrace.dev',
  },
] as const;
