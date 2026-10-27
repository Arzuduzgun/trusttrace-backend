import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'src';
const violations = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (full.endsWith('.ts')) inspect(full);
  }
}

function inspect(file) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
      return;
    }

    const usesUnknown = /:\s*unknown\b|<\s*unknown\s*>/.test(line);
    if (usesUnknown) {
      const prevLine = i > 0 ? lines[i - 1] : '';
      const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
      const hasBoundary =
        line.includes('// boundary: validated') ||
        prevLine.includes('// boundary: validated') ||
        nextLine.includes('// boundary: validated');

      if (!hasBoundary) {
        violations.push(`${file}:${i + 1}  ${trimmed}`);
      }
    }
  });
}

walk(ROOT);

if (violations.length > 0) {
  console.error(
    '❌ Unsanctioned `unknown`. It is allowed only at real input boundaries — mark it with // boundary: validated\n',
  );
  for (const v of violations) console.error('   ' + v);
  process.exit(1);
}
console.log('✅ guard:unknown — all `unknown` usage is sanctioned');
