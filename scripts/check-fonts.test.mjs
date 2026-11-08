import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { checkFonts } from './check-fonts.mjs';

test('requires a Vietnamese font for each actual font weight', () => {
  const directory = mkdtempSync(join(tmpdir(), 'bep-font-test-'));
  try {
    assert.throws(() => checkFonts(directory), /vollkorn-vietnamese-600/);
    for (const font of [
      'vollkorn-vietnamese-600',
      'hanken-grotesk-vietnamese-400',
      'hanken-grotesk-vietnamese-600',
    ]) {
      writeFileSync(join(directory, `${font}-normal-test.woff2`), 'fixture');
    }
    assert.equal(checkFonts(directory), 3);
    rmSync(join(directory, 'hanken-grotesk-vietnamese-600-normal-test.woff2'));
    assert.throws(() => checkFonts(directory), /hanken-grotesk-vietnamese-600/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
