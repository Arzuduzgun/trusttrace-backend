const API_URL = process.env['API_URL'] ?? 'http://localhost:4000/api/v1';
const PASSWORD = 'Demo12345';
const CUSTOMERS = ['ali@trusttrace.dev', 'zeynep@trusttrace.dev'];
const REQUESTS_PER_CUSTOMER = 3;

interface Envelope<T> {
  success: boolean;
  data: T;
}

async function login(email: string): Promise<string> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const body = (await response.json()) as Envelope<{ accessToken: string }>;
  return body.data.accessToken;
}

async function startDirect(token: string): Promise<string> {
  const response = await fetch(`${API_URL}/rooms/direct`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = (await response.json()) as Envelope<{ name: string }>;
  return body.data.name.split(' – ')[1] ?? '?';
}

async function main(): Promise<void> {
  const tokens = await Promise.all(CUSTOMERS.map(login));
  const agents = await Promise.all(
    tokens.flatMap((token) =>
      Array.from({ length: REQUESTS_PER_CUSTOMER }, () => startDirect(token)),
    ),
  );
  const perAgent = new Map<string, number>();
  for (const agent of agents) {
    perAgent.set(agent, (perAgent.get(agent) ?? 0) + 1);
  }
  console.table(Object.fromEntries(perAgent));
}

void main();
