import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { assertRed, withFiles } from './lib/drill.mjs';

const root = process.cwd();
const run = (command, args, options = {}) =>
  spawnSync(command, args, { cwd: root, encoding: 'utf8', ...options });
const git = (...args) => run('git', args);
const status = () => {
  const result = git('status', '--porcelain');
  if (result.status !== 0) throw new Error('Cannot read Git status.');
  return result.stdout;
};
if (status().trim()) throw new Error('Commit changes before running the reversible drill.');
const eslint = [resolve('node_modules/eslint/bin/eslint.js'), '.', '--max-warnings', '0'];
const view = 'projects/customer/src/app/features/drill/pages/probe.ts';
const generatedModel = 'projects/api-client/src/generated/models/publicBranch.ts';
const cases = [
  {
    name: 'cross-app-import',
    changes: {
      'projects/customer/src/app/probe.ts':
        "import { App } from '../../../admin/src/app/app'; export const probe = App;",
    },
    args: eslint,
    expected: /boundaries\/dependencies/,
  },
  {
    name: 'view-imports-endpoints',
    changes: {
      [view]:
        "import { endpoint } from '@bepthaymao/api-client/endpoints'; export const probe = endpoint;",
      'projects/api-client/src/generated/endpoints/index.ts': 'export const endpoint = 1;',
    },
    args: eslint,
    expected: /boundaries\/dependencies/,
  },
  {
    name: 'view-imports-httpclient',
    changes: {
      [view]: "import { HttpClient } from '@angular/common/http'; export const probe = HttpClient;",
    },
    args: eslint,
    expected: /no-restricted-imports/,
  },
  {
    name: 'circular-dependency',
    changes: {
      'projects/core/src/lib/drill-first.ts':
        "import { second } from './drill-second'; export function first(): number { return second(); }",
      'projects/core/src/lib/drill-second.ts':
        "import { first } from './drill-first'; export function second(): number { return first(); }",
    },
    args: [
      resolve('node_modules/madge/bin/cli.js'),
      '--circular',
      '--extensions',
      'ts',
      '--ts-config',
      'tsconfig.json',
      'projects',
    ],
    expected: /circular dependency/i,
  },
  {
    name: 'api-drift',
    changes: {
      [generatedModel]: readFileSync(generatedModel, 'utf8').replace('id: string;', 'id: number;'),
    },
    args: ['scripts/api-check.mjs'],
    expected: /LỆCH/,
  },
  {
    name: 'ts-ignore-without-reason',
    changes: { [view]: '// @ts-ignore\nexport const probe = 1;\n' },
    args: ['scripts/check-suppressions.mjs'],
    expected: /suppression/,
  },
  {
    name: 'eslint-disable-without-reason',
    changes: {
      [view]:
        '// eslint-disable-next-line @typescript-eslint/no-explicit-any\nexport const probe: any = 1;\n',
    },
    args: ['scripts/check-suppressions.mjs'],
    expected: /suppression/,
  },
];
try {
  for (const drill of cases) {
    const evidence = withFiles(root, drill.changes, () =>
      assertRed(run(process.execPath, drill.args), drill.expected),
    );
    console.log(`${drill.name} | ĐỎ ĐÚNG | ${evidence}`);
  }
  const cli = resolve('node_modules/@commitlint/cli/cli.js');
  const evidence = assertRed(
    run(process.execPath, [cli], { input: 'Update stuff\n' }),
    /type-empty|subject-empty/,
  );
  if (
    run(process.execPath, [cli], { input: 'feat(01-03): add frontend foundation\n' }).status !== 0
  ) {
    throw new Error('Conventional Commit rejected.');
  }
  console.log(`commit-message | ĐỎ ĐÚNG | ${evidence}`);
  const policyDirectory = mkdtempSync(join(tmpdir(), 'bep-license-drill-'));
  try {
    const strictPolicy = JSON.parse(readFileSync('scripts/license-policy.json', 'utf8'));
    strictPolicy.allow = strictPolicy.allow.filter((license) => license !== 'MIT');
    const policyFile = join(policyDirectory, 'policy.json');
    writeFileSync(policyFile, JSON.stringify(strictPolicy));
    const proof = assertRed(
      run(process.execPath, ['scripts/license-check.mjs'], {
        env: { ...process.env, LICENSE_POLICY_FILE: policyFile },
      }),
      /VI PHẠM .+ MIT/,
    );
    console.log(`license-outside-allowlist | ĐỎ ĐÚNG | ${proof}`);
  } finally {
    rmSync(policyDirectory, { recursive: true, force: true });
  }
  const secretPath = 'drill-secret.txt';
  withFiles(root, { [secretPath]: 'ghp_' + randomBytes(18).toString('hex') + '\n' }, () => {
    try {
      if (git('add', '--', secretPath).status !== 0) throw new Error('Cannot stage secret probe.');
      const proof = assertRed(
        run(process.execPath, ['scripts/scan-secrets.mjs', '--staged']),
        /leaks found:\s*[1-9]/,
      );
      console.log(`secret-in-diff | ĐỎ ĐÚNG | ${proof}`);
    } finally {
      if (git('reset', '-q', 'HEAD', '--', secretPath).status !== 0)
        throw new Error('Cannot unstage secret probe.');
    }
  });
} finally {
  if (status().trim()) throw new Error('Drill did not restore a clean working tree.');
}
