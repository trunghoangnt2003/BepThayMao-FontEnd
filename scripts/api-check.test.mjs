import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { tree } from './api-check.mjs';
test('compares generated file names and normalized content, detecting one-byte drift', () => {
  const a = mkdtempSync(join(tmpdir(), 'bep-tree-a-'));
  const b = mkdtempSync(join(tmpdir(), 'bep-tree-b-'));
  try {
    writeFileSync(join(a, 'client.ts'), 'export {};\r\n');
    writeFileSync(join(b, 'client.ts'), 'export {};\n');
    assert.deepEqual(tree(a), tree(b));
    writeFileSync(join(b, 'client.ts'), 'export {x};\n');
    assert.notDeepEqual(tree(a), tree(b));
  } finally {
    rmSync(a, { recursive: true, force: true });
    rmSync(b, { recursive: true, force: true });
  }
});
