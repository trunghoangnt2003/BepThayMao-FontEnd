import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { diffTrees, isSame } from './tree-diff.mjs';

const generated = 'projects/api-client/src/generated';

test('an untouched copy of the generated client matches', () => {
  const directory = mkdtempSync(join(tmpdir(), 'bep-tree-'));
  try {
    cpSync(generated, directory, { recursive: true });
    assert.equal(isSame(diffTrees(generated, directory)), true);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('one changed byte, a missing and an extra file are all reported', () => {
  const directory = mkdtempSync(join(tmpdir(), 'bep-tree-'));
  try {
    cpSync(generated, directory, { recursive: true });
    writeFileSync(
      join(directory, 'models', 'publicBranch.ts'),
      'export interface PublicBranch { id: number }\n',
    );
    rmSync(join(directory, 'models', 'index.ts'));
    writeFileSync(join(directory, 'stray.ts'), '');
    const diff = diffTrees(generated, directory);
    assert.deepEqual(diff, {
      missing: ['models/index.ts'],
      extra: ['stray.ts'],
      changed: ['models/publicBranch.ts'],
    });
    assert.equal(isSame(diff), false);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('line ending differences are ignored', () => {
  const left = mkdtempSync(join(tmpdir(), 'bep-tree-'));
  const right = mkdtempSync(join(tmpdir(), 'bep-tree-'));
  try {
    writeFileSync(join(left, 'a.ts'), 'a\nb\n');
    writeFileSync(join(right, 'a.ts'), 'a\r\nb\r\n');
    assert.equal(isSame(diffTrees(left, right)), true);
  } finally {
    rmSync(left, { recursive: true, force: true });
    rmSync(right, { recursive: true, force: true });
  }
});
