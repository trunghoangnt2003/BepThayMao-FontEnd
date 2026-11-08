import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const child = spawn(
  process.execPath,
  [resolve('node_modules/@angular/cli/bin/ng.js'), ...process.argv.slice(2)],
  { stdio: ['inherit', 'pipe', 'pipe'] },
);
let output = '';
for (const [source, target] of [
  [child.stdout, process.stdout],
  [child.stderr, process.stderr],
]) {
  source.on('data', (chunk) => {
    output += chunk.toString();
    target.write(chunk);
  });
}
child.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on('close', (code) => {
  process.exitCode = code || (/\bWARNING\b|▲/i.test(output) ? 1 : 0);
});
