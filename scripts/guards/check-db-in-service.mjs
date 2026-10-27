import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'src';
const DB_TOKENS = [
  /\bdb\s*\./,
  /\bdrizzle\b/i,
  /\bpgTable\b/,
  /\.execute\s*\(/,
  /\bcollection\s*\(/,
  /\bInjectModel\b/,
  /\bModel\s*</,
  /\bmongoose\b/i,
];
const violations = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (full.endsWith('.service.ts')) inspect(full);
  }
}

function inspect(file) {
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      if (DB_TOKENS.some((token) => token.test(line))) {
        violations.push(`${file}:${i + 1}  ${line.trim()}`);
      }
    });
}

walk(ROOT);

if (violations.length > 0) {
  console.error(
    '❌ Database access inside a service. Repositories are the only layer that talks to the database.\n',
  );
  for (const v of violations) console.error('   ' + v);
  process.exit(1);
}
console.log('✅ guard:db — services are clean');
