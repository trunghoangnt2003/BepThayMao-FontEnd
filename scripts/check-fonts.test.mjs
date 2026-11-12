import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { checkFonts } from './check-fonts.mjs';

test('requires a Vietnamese font for each actual font weight', () => {
  const directory = mkdtempSync(join(tmpdir(), 'bep-font-test-'));
  try {
    assert.throws(() => checkFonts(directory), /be-vietnam-pro-vietnamese-400/);
    for (const font of [
      'be-vietnam-pro-vietnamese-400',
      'be-vietnam-pro-vietnamese-600',
      'be-vietnam-pro-vietnamese-700',
      'be-vietnam-pro-vietnamese-800',
    ]) {
      writeFileSync(join(directory, `${font}-normal-test.woff2`), 'fixture');
    }
    assert.equal(checkFonts(directory), 4);
    rmSync(join(directory, 'be-vietnam-pro-vietnamese-800-normal-test.woff2'));
    assert.throws(() => checkFonts(directory), /be-vietnam-pro-vietnamese-800/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
