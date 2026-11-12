import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { channel: process.env['CI'] ? undefined : 'chrome', trace: 'retain-on-failure' },
  projects: [
    {
      name: 'customer',
      testIgnore: /\.admin\.spec\.ts$/,
      use: { baseURL: process.env['E2E_CUSTOMER_URL'] ?? 'http://127.0.0.1:8080' },
    },
    {
      name: 'admin',
      testIgnore: /\.customer\.spec\.ts$/,
      use: { baseURL: process.env['E2E_ADMIN_URL'] ?? 'http://127.0.0.1:8080/admin/' },
    },
  ],
  webServer:
    process.env['E2E_START_SERVERS'] === '1'
      ? [
          {
            command: 'node dist/customer/server/server.mjs',
            url: 'http://127.0.0.1:4000/healthz',
            env: { PORT: '4000', NG_ALLOWED_HOSTS: 'localhost,127.0.0.1' },
            reuseExistingServer: !process.env['CI'],
          },
          {
            command: 'npm run start:admin',
            url: 'http://127.0.0.1:4201/admin/',
            reuseExistingServer: !process.env['CI'],
          },
        ]
      : undefined,
});
