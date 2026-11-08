import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const child = spawn(
  process.execPath,
  [resolve('node_modules/@playwright/test/cli.js'), 'test', ...process.argv.slice(2)],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      E2E_START_SERVERS: '1',
      E2E_CUSTOMER_URL: 'http://127.0.0.1:4000',
      E2E_ADMIN_URL: 'http://127.0.0.1:4201/admin/',
    },
  },
);
child.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on('close', (code) => {
  process.exitCode = code === 0 ? 0 : 1;
});
