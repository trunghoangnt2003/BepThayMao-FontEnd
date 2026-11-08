import assert from 'node:assert/strict';
import { test } from 'node:test';
import { invalidSuppression } from './check-suppressions.mjs';

test('requires a substantive reason for each allowed suppression', () => {
  assert.equal(invalidSuppression('// eslint-disable-next-line rule'), true);
  assert.equal(invalidSuppression('// eslint-disable-next-line rule -- short'), true);
  assert.equal(
    invalidSuppression(
      '// eslint-disable-next-line rule -- compatibility with documented browser API',
    ),
    false,
  );
  assert.equal(
    invalidSuppression('// @ts-expect-error -- deliberately invalid payload for a negative test'),
    false,
  );
  assert.equal(invalidSuppression('export const value = 1;'), false);
});

test('never permits ts-ignore or ts-nocheck, even when a reason is supplied', () => {
  assert.equal(invalidSuppression('// @ts-ignore -- this reason must not bypass the rule'), true);
  assert.equal(invalidSuppression('// @ts-nocheck -- this reason must not bypass the rule'), true);
});
