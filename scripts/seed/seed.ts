//Listedeki verileri veritabanına yazar.
import * as bcrypt from 'bcrypt';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../src/database/schema';
import { moderationRules, roomMembers, rooms, users } from '../../src/database/schema';
import { normalizeText, toWords } from '../../src/modules/moderation/text-normalizer';
import {
  DEMO_PASSWORD,
  SEED_DIRECT_ROOMS,
  SEED_PRODUCT_ROOMS,
  SEED_RULES,
  SEED_USERS,
} from './seed-data';

process.loadEnvFile();

const databaseUrl = process.env['DATABASE_URL'];
if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing in .env');
}

const pool = new Pool({ connectionString: databaseUrl });
const db = drizzle(pool, { schema });

type RoomType = 'DIRECT' | 'PRODUCT';
type MemberRole = 'CUSTOMER' | 'AGENT';

/*Demo şifresini bir kez bcrypt ile hash’ler.
Kullanıcıları ekler. onConflictDoNothing({ target: users.email }) şu demek: “bu e-posta zaten varsa hata verme, atla.” Tekrar çalıştırılabilirliğin sırrı bu satır.
Bütün kullanıcıların e-postasını ve id’sini bir harita (Map) olarak döner. Sonraki adımlar e-postadan id’yi bu haritadan bulur.*/
async function seedUsers(): Promise<Map<string, string>> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  await db
    .insert(users)
    .values(SEED_USERS.map((user) => ({ ...user, passwordHash })))
    .onConflictDoNothing({ target: users.email });
  const rows = await db.select({ id: users.id, email: users.email }).from(users);
  return new Map(rows.map((row) => [row.email, row.id]));
}

//Haritadan e-postanın id’sini bulur. Bulamazsa açık bir hata fırlatır. Veri dosyasında e-posta yanlış yazılırsa sessizce geçmez.
function idOf(ids: Map<string, string>, email: string): string {
  const id = ids.get(email);
  if (!id) {
    throw new Error(`Seed user not found: ${email}`);
  }
  return id;
}

async function seedRules(adminId: string): Promise<void> {
  await db
    .insert(moderationRules)
    .values(
      SEED_RULES.map((rule) => {
        const pattern = toWords(normalizeText(rule.pattern)).join(' ');
        return {
          pattern,
          matchType: pattern.includes(' ') ? ('PHRASE' as const) : ('WORD' as const),
          action: rule.action,
          createdBy: adminId,
        };
      }),
    )
    .onConflictDoNothing({ target: moderationRules.pattern });
}

async function findOrCreateRoom(type: RoomType, name: string, createdBy: string): Promise<string> {
  const [existing] = await db
    .select({ id: rooms.id })
    .from(rooms)
    .where(and(eq(rooms.type, type), eq(rooms.name, name)))
    .limit(1);
  if (existing) {
    return existing.id;
  }
  const [created] = await db.insert(rooms).values({ type, name, createdBy }).returning({ id: rooms.id });
  if (!created) {
    throw new Error(`Room could not be created: ${name}`);
  }
  return created.id;
}

async function addMembers(
  roomId: string,
  members: { userId: string; memberRole: MemberRole }[],
): Promise<void> {
  if (members.length === 0) {
    return;
  }
  await db
    .insert(roomMembers)
    .values(members.map((member) => ({ ...member, roomId })))
    .onConflictDoNothing();
}

async function seedRooms(ids: Map<string, string>, adminId: string): Promise<void> {
  for (const room of SEED_PRODUCT_ROOMS) {
    const roomId = await findOrCreateRoom('PRODUCT', room.name, adminId);
    await addMembers(roomId, [
      { userId: idOf(ids, room.agentEmail), memberRole: 'AGENT' },
      ...room.customerEmails.map((email) => ({ userId: idOf(ids, email), memberRole: 'CUSTOMER' as const })),
    ]);
  }
  for (const room of SEED_DIRECT_ROOMS) {
    const customerId = idOf(ids, room.customerEmail);
    const roomId = await findOrCreateRoom('DIRECT', room.name, customerId);
    await addMembers(roomId, [
      { userId: customerId, memberRole: 'CUSTOMER' },
      { userId: idOf(ids, room.agentEmail), memberRole: 'AGENT' },
    ]);
  }
}

async function main(): Promise<void> {
  const ids = await seedUsers();
  const adminId = idOf(ids, 'admin@trusttrace.dev');
  await seedRules(adminId);
  await seedRooms(ids, adminId);
  console.log('Seed completed. Demo accounts (password: %s):', DEMO_PASSWORD);
  for (const user of SEED_USERS) {
    console.log(`  ${user.role.padEnd(8)} ${user.email}`);
  }
}

void main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());