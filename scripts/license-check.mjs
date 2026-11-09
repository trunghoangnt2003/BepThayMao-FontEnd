import { readFileSync } from 'node:fs';
import { evaluatePolicy } from './lib/license-policy.mjs';
const policy = JSON.parse(
  readFileSync(process.env.LICENSE_POLICY_FILE ?? 'scripts/license-policy.json', 'utf8'),
);
const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
const packages = Object.entries(lock.packages)
  .filter(([path, item]) => path && !item.dev)
  .map(([path, item]) => ({
    package: `${path.split('node_modules/').at(-1)}@${item.version}`,
    license: item.license,
  }));
const violations = evaluatePolicy(packages, policy);
for (const item of violations) console.error(`${item.package}: ${item.license ?? 'UNKNOWN'}`);
console.log(`Production licenses: ${packages.length} checked, ${violations.length} violations.`);
process.exitCode = violations.length ? 1 : 0;
