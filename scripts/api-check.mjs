// Fails when the committed generated client differs from a fresh Orval run, or (full workspace only)
// when openapi/v1.json is stale against ../backend.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { diffTrees, isSame } from './lib/tree-diff.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const committed = join(root, 'projects', 'api-client', 'src', 'generated');
const directory = mkdtempSync(join(tmpdir(), 'bep-api-check-'));
let failed = false;
try {
  if (existsSync(join(root, '..', 'backend', 'openapi', 'v1.json'))) {
    const sync = spawnSync(process.execPath, [join(root, 'scripts', 'api-sync.mjs'), '--check'], {
      stdio: 'inherit',
    });
    failed ||= sync.status !== 0;
  } else {
    console.log('Bỏ qua so với backend: không có ../backend.');
  }

  const orval = spawnSync(
    process.execPath,
    [
      join(root, 'node_modules', 'orval', 'dist', 'bin', 'orval.mjs'),
      '--config',
      'orval.config.ts',
    ],
    { cwd: root, encoding: 'utf8', env: { ...process.env, ORVAL_OUT: directory } },
  );
  if (orval.error || orval.status !== 0)
    throw new Error(`Orval lỗi:\n${orval.stdout}${orval.stderr}`);

  const diff = diffTrees(committed, directory);
  for (const file of diff.changed) console.error(`LỆCH   ${file}`);
  for (const file of diff.missing)
    console.error(`THIẾU  ${file} (có trong repo, Orval không sinh)`);
  for (const file of diff.extra) console.error(`THỪA   ${file} (Orval sinh, chưa commit)`);
  if (isSame(diff)) console.log('Client sinh khớp openapi/v1.json.');
  else {
    console.error('Chạy npm run api:generate rồi commit projects/api-client/src/generated.');
    failed = true;
  }
} catch (error) {
  console.error(error.message);
  failed = true;
} finally {
  rmSync(directory, { recursive: true, force: true });
}
process.exitCode = failed ? 1 : 0;
