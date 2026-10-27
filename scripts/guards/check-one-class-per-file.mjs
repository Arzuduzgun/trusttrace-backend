import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'src';
const violations = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (full.endsWith('.ts') && !full.endsWith('.d.ts')) inspect(full);
  }
}

function inspect(file) {
  const content = readFileSync(file, 'utf8');
  const matches = content.match(/export\s+(default\s+)?class\s+\w+/g) || [];
  if (matches.length > 1) {
    violations.push(`${file} (found ${matches.length} exported classes: ${matches.join(', ')})`);
  }
}

walk(ROOT);

if (violations.length > 0) {
  console.error('❌ Violation: Exactly one exported class per file is allowed.\n');
  for (const v of violations) console.error('   ' + v);
  process.exit(1);
}
console.log('✅ guard:one-class — all files export at most one class');
