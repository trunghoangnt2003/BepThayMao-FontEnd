import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
const source = '../backend/openapi/v1.json';
if (!existsSync(source)) {
  console.error(
    'Không thấy ../backend/openapi/v1.json: chạy scripts/workspace.sh sync ở repo docs',
  );
  process.exitCode = 2;
} else {
  const content = readFileSync(source);
  if (process.argv.includes('--check')) {
    if (!existsSync('openapi/v1.json') || !content.equals(readFileSync('openapi/v1.json'))) {
      console.error('Bản sao OpenAPI lỗi thời. Chạy npm run api:sync.');
      process.exitCode = 1;
    }
  } else {
    mkdirSync('openapi', { recursive: true });
    writeFileSync('openapi/v1.json', content);
  }
}
