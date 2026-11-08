import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

for (const project of readdirSync('projects')) {
  for (const config of readdirSync(resolve('projects', project)).filter((name) =>
    /^tsconfig\.(app|lib|spec)\.json$/.test(name),
  )) {
    const result = spawnSync(
      process.execPath,
      [
        resolve('node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js'),
        '--noEmit',
        '-p',
        resolve('projects', project, config),
      ],
      { stdio: 'inherit' },
    );
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
}
const e2e = spawnSync(
  process.execPath,
  [resolve('node_modules/typescript/bin/tsc'), '--noEmit', '-p', 'e2e/tsconfig.json'],
  { stdio: 'inherit' },
);
if (e2e.error) throw e2e.error;
if (e2e.status !== 0) process.exit(e2e.status ?? 1);
const madge = spawnSync(
  process.execPath,
  [
    resolve('node_modules/madge/bin/cli.js'),
    '--circular',
    '--extensions',
    'ts',
    '--ts-config',
    'tsconfig.json',
    'projects',
  ],
  { stdio: 'inherit' },
);
if (madge.error) throw madge.error;
process.exitCode = madge.status ?? 1;
