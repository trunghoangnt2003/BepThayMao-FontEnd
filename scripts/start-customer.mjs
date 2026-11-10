// ng serve's SSR does not apply build.options.security.allowedHosts in dev mode, so pass the same
// hosts through NG_ALLOWED_HOSTS (set here because npm runs scripts with cmd.exe on Windows, P11).
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const child = spawn(
  process.execPath,
  [
    resolve('node_modules/@angular/cli/bin/ng.js'),
    'serve',
    'customer',
    '--port',
    '4200',
    ...process.argv.slice(2),
  ],
  { stdio: 'inherit', env: { NG_ALLOWED_HOSTS: 'localhost,127.0.0.1', ...process.env } },
);
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
