import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function invalidSuppression(line) {
  return (
    /(eslint-disable|@ts-expect-error|@ts-ignore|@ts-nocheck)/.test(line) &&
    (!/--\s*\S.{9,}/.test(line) || /@ts-(ignore|nocheck)/.test(line))
  );
}

function checkDirectory(directory) {
  let failures = 0;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory() && entry.name !== 'generated') failures += checkDirectory(file);
    else if (entry.isFile() && /\.(ts|html|css)$/.test(entry.name)) {
      for (const [index, line] of readFileSync(file, 'utf8').split('\n').entries()) {
        if (invalidSuppression(line)) {
          console.error(`${file}:${index + 1}: suppression thiếu lý do hoặc dùng chỉ thị bị cấm.`);
          failures += 1;
        }
      }
    }
  }
  return failures;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = checkDirectory('projects') > 0 ? 1 : 0;
}
