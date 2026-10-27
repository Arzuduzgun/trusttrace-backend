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

    if (/Promise\s*<\s*(void|any)\s*>/.test(line)) {
      const prevLine = i > 0 ? lines[i - 1] : '';
      const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
      const hasVoidOk =
        line.includes('// void-ok') ||
        prevLine.includes('// void-ok') ||
        nextLine.includes('// void-ok');

      if (!hasVoidOk) {
        violations.push(`${file}:${i + 1}  ${trimmed}`);
      }
    }
  });
}

walk(ROOT);

if (violations.length > 0) {
  console.error(
    '❌ Untyped promise found. Declare a concrete result type, or mark a genuine side effect with // void-ok\n',
  );
  for (const v of violations) console.error('   ' + v);
  process.exit(1);
}
console.log('✅ guard:promise — no untyped promises');
