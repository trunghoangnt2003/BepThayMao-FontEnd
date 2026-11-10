// Copies ../backend/openapi/v1.json byte-for-byte to openapi/v1.json (ADR-0010 §5). --check only compares.
import { copyFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, '..', 'backend', 'openapi', 'v1.json');
const target = join(root, 'openapi', 'v1.json');

if (!existsSync(source)) {
  console.error(
    'Không thấy ../backend/openapi/v1.json: chạy scripts/workspace.sh sync ở repo docs.',
  );
  process.exit(2);
}

if (process.argv.includes('--check')) {
  const same = existsSync(target) && readFileSync(source).equals(readFileSync(target));
  console.log(
    same
      ? 'openapi/v1.json khớp backend.'
      : 'openapi/v1.json lỗi thời: chạy npm run api:sync && npm run api:generate.',
  );
  process.exit(same ? 0 : 1);
}

copyFileSync(source, target);
console.log('Đã chép openapi/v1.json từ backend.');
