import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, normalize } from 'node:path';

const ROOT = 'src';
const ALLOWED_DIR = normalize('src/config');
const violations = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (full.endsWith('.ts')) inspect(full);
  }
}

function inspect(file) {
  const normalizedFile = normalize(file);
  if (normalizedFile.startsWith(ALLOWED_DIR)) {
    return;
  }

  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
      return;
    }

    if (/\bprocess\.env\b/.test(line)) {
      violations.push(`${file}:${i + 1}  ${trimmed}`);
    }
  });
}

walk(ROOT);

if (violations.length > 0) {
  console.error(
    '❌ Direct access to `process.env` found outside config layer. Use AppConfigService instead.\n',
  );
  for (const v of violations) console.error('   ' + v);
  process.exit(1);
}
console.log('✅ guard:env — process.env is encapsulated');
