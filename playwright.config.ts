import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { channel: process.env['CI'] === 'true' ? undefined : 'chrome', trace: 'retain-on-failure' },
  projects: [
    {
      name: 'customer',
      testMatch: 'customer-*.spec.ts',
      use: { baseURL: process.env['E2E_CUSTOMER_URL'] ?? 'http://127.0.0.1:8080' },
    },
    {
      name: 'admin',
      testMatch: 'admin-*.spec.ts',
      use: { baseURL: process.env['E2E_ADMIN_URL'] ?? 'http://127.0.0.1:8080/admin/' },
    },
  ],
  webServer:
    process.env['E2E_START_SERVERS'] === '1'
      ? [
          ...(process.env['E2E_MOCK_API'] === '1'
            ? [
                {
                  command: 'node e2e/mock-api.mjs',
                  url: 'http://127.0.0.1:5080/health/live',
                  reuseExistingServer: false,
                },
              ]
            : []),
          {
            command: 'node dist/customer/server/server.mjs',
            url: 'http://127.0.0.1:4000/healthz',
            env: { PORT: '4000', NG_ALLOWED_HOSTS: 'localhost,127.0.0.1' },
            reuseExistingServer: false,
          },
          {
            command: 'npm run start:admin -- --host 127.0.0.1',
            url: 'http://127.0.0.1:4201/admin/',
            reuseExistingServer: false,
            timeout: 120000,
          },
        ]
      : undefined,
});
