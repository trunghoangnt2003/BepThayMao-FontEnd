// Production npm licenses against scripts/license-policy.json (or LICENSE_POLICY_FILE for drills).
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { evaluatePolicy } from './lib/license-policy.mjs';

try {
  const policy = JSON.parse(
    readFileSync(process.env['LICENSE_POLICY_FILE'] ?? 'scripts/license-policy.json', 'utf8'),
  );
  const result = spawnSync(
    process.execPath,
    [
      resolve('node_modules/license-checker-rseidelsohn/bin/license-checker-rseidelsohn.js'),
      '--production',
      '--excludePrivatePackages',
      '--json',
    ],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  );
  if (result.error || result.status !== 0) throw new Error(result.stderr || 'license-checker lỗi');
  const packages = Object.entries(JSON.parse(result.stdout)).map(([id, info]) => {
    const at = id.lastIndexOf('@');
    const licenses = Array.isArray(info.licenses) ? info.licenses.join(' OR ') : info.licenses;
    return { name: id.slice(0, at), version: id.slice(at + 1), license: licenses };
  });
  const violations = evaluatePolicy(packages, policy);
  for (const violation of violations)
    console.error(`VI PHẠM  ${violation.package}  ${violation.license}`);
  console.log(
    `Đã kiểm ${packages.length.toString()} gói npm production, ${violations.length.toString()} vi phạm, ${policy.exceptions.length.toString()} ngoại lệ có lý do.`,
  );
  process.exitCode = violations.length ? 1 : 0;
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
