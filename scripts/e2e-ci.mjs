import express from 'express';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { setTimeout } from 'node:timers/promises';

const app = express();
app.use(express.json());
app.post('/api/v1/auth/login', (request, response) => {
  const { identifier, password } = request.body;
  if (identifier === 'rate-limited')
    return response.status(429).json({ title: 'Too many requests', correlationId: 'mock-rate' });
  if (!['owner', 'quanly1', 'khach1'].includes(identifier) || password !== 'mock-password-only')
    return response.status(401).json({ title: 'Unauthorized', correlationId: 'mock-login' });
  const role =
    identifier === 'owner' ? 'Owner' : identifier === 'quanly1' ? 'BranchManager' : 'Customer';
  response.cookie('refresh_token', identifier, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/api/v1/auth',
  });
  return response.json({
    accessToken: 'mock-access-' + identifier,
    identifier,
    role,
    expiresIn: 900,
  });
});
app.post('/api/v1/auth/refresh', (request, response) => {
  const identifier = /(?:^|;\s*)refresh_token=(owner|quanly1|khach1)(?:;|$)/.exec(
    request.headers.cookie ?? '',
  )?.[1];
  if (!identifier)
    return response.status(401).json({ title: 'Unauthorized', correlationId: 'mock-refresh' });
  const role =
    identifier === 'owner' ? 'Owner' : identifier === 'quanly1' ? 'BranchManager' : 'Customer';
  return response.json({
    accessToken: 'mock-access-' + identifier,
    identifier,
    role,
    expiresIn: 900,
  });
});
app.post('/api/v1/auth/logout', (_request, response) => {
  response.clearCookie('refresh_token', { path: '/api/v1/auth' });
  response.status(204).end();
});
app.get('/api/v1/branches', (_request, response) =>
  response.json([
    {
      id: '019a5dc0-0001-7000-8000-000000000001',
      name: 'Cơ sở Mẫu 1',
      address: 'Số 1 Đường Mẫu',
      phone: '02800000001',
      openTime: '06:00',
      closeTime: '21:30',
    },
    {
      id: '019a5dc0-0002-7000-8000-000000000002',
      name: 'Cơ sở Mẫu 2',
      address: 'Số 2 Đường Mẫu',
      phone: '02800000002',
      openTime: '07:00',
      closeTime: '21:00',
    },
  ]),
);
app.use('/admin', express.static(resolve('dist/admin/browser')));
app.get('/admin/{*path}', (_request, response) =>
  response.sendFile(resolve('dist/admin/browser/index.html')),
);
const server = app.listen(18080, '127.0.0.1');
const customer = spawn(process.execPath, ['dist/customer/server/server.mjs'], {
  env: {
    ...process.env,
    PORT: '14000',
    API_INTERNAL_URL: 'http://127.0.0.1:18080',
    SITE_URL: 'http://localhost:14000',
    NG_ALLOWED_HOSTS: 'localhost,127.0.0.1',
  },
  stdio: 'inherit',
});
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      ready = (await fetch('http://127.0.0.1:14000/healthz')).ok;
    } catch {
      /* Server is starting; retry within the bounded startup deadline. */
    }
    if (ready) break;
    await setTimeout(100);
  }
  if (!ready) throw new Error('SSR startup timed out.');
  const test = spawn(process.execPath, ['node_modules/@playwright/test/cli.js', 'test'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      E2E_CUSTOMER_URL: 'http://127.0.0.1:14000',
      E2E_ADMIN_URL: 'http://127.0.0.1:18080/admin/',
    },
  });
  process.exitCode = await new Promise((resolveCode, reject) => {
    test.on('error', reject);
    test.on('exit', (code) => resolveCode(code ?? 1));
  });
} finally {
  customer.kill();
  server.closeAllConnections();
  server.close();
}
