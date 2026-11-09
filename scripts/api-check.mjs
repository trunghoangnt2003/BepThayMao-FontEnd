import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export function tree(directory, root = directory) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory()
        ? tree(path, root)
        : [
            [
              relative(root, path).replaceAll('\\', '/'),
              readFileSync(path, 'utf8').replaceAll('\r\n', '\n'),
            ],
          ];
    })
    .sort(([a], [b]) => a.localeCompare(b));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const directory = mkdtempSync(join(tmpdir(), 'bep-client-'));
  try {
    if (existsSync('../backend/openapi/v1.json')) {
      const sync = spawnSync(process.execPath, ['scripts/api-sync.mjs', '--check'], {
        stdio: 'inherit',
      });
      if (sync.status !== 0) throw new Error('OpenAPI drift.');
    }
    const generate = spawnSync(
      process.execPath,
      ['node_modules/orval/./dist/bin/orval.mjs', '--config', 'orval.config.ts'],
      { env: { ...process.env, ORVAL_OUT: directory.replaceAll('\\', '/') }, stdio: 'inherit' },
    );
    if (generate.status !== 0) throw new Error('Không sinh được client.');
    if (
      JSON.stringify(tree(directory)) !== JSON.stringify(tree('projects/api-client/src/generated'))
    )
      throw new Error('Client lỗi thời. Chạy api:generate.');
    console.log('API client khớp hợp đồng.');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
