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

export const SEED_PRODUCT_ROOMS = [
  {
    name: 'Kablosuz Kulaklık Destek',
    agentEmail: 'ayse@trusttrace.dev',
    customerEmails: ['ali@trusttrace.dev', 'zeynep@trusttrace.dev'],
  },
  {
    name: 'Akıllı Saat Destek',
    agentEmail: 'mehmet@trusttrace.dev',
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