// Smoke for the customer/admin images (run npm run docker:build first). Uses the API on host port
// 5080 when one is running, otherwise starts e2e/mock-api.mjs so this repo stays self-contained.
import { spawn, spawnSync } from 'node:child_process';
import { connect } from 'node:net';

const containers = { customer: 'bepthaymao-smoke-customer', admin: 'bepthaymao-smoke-admin' };
const results = [];
const record = (name, ok, detail = '') => results.push({ name, ok, detail });
const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
const docker = (...args) => spawnSync('docker', args, { encoding: 'utf8' });

const portOpen = (port) =>
  new Promise((resolve) => {
    const socket = connect(port, '127.0.0.1');
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => resolve(false));
  });

async function get(url, seconds = 30) {
  for (let elapsed = 0; elapsed < seconds; elapsed += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
      return { status: response.status, body: await response.text() };
    } catch {
      await sleep(1000);
    }
  }
  return { status: 0, body: '' };
}

let mock;
try {
  if (!(await portOpen(5080)))
    mock = spawn(process.execPath, ['e2e/mock-api.mjs'], { stdio: 'ignore' });
  for (const [image, forbidden] of [
    ['bepthaymao-customer:dev', ['', 'root', '0']],
    ['bepthaymao-admin:dev', ['', 'root', '0']],
  ]) {
    const user = docker('image', 'inspect', '--format', '{{.Config.User}}', image).stdout.trim();
    record(`${image} không chạy root`, !forbidden.includes(user), `user=${user || '(rỗng)'}`);
  }

  docker(
    'run',
    '-d',
    '--rm',
    '--name',
    containers.customer,
    '--add-host',
    'host.docker.internal:host-gateway',
    '-e',
    'API_INTERNAL_URL=http://host.docker.internal:5080',
    '-e',
    'NG_ALLOWED_HOSTS=localhost,127.0.0.1',
    '-e',
    'SITE_URL=http://localhost:8080',
    '-p',
    '127.0.0.1:4100:4000',
    'bepthaymao-customer:dev',
  );
  record('customer /healthz 200', (await get('http://127.0.0.1:4100/healthz')).status === 200);
  const page = await get('http://127.0.0.1:4100/co-so');
  record(
    'customer /co-so 200 có "Cơ sở Mẫu 1"',
    page.status === 200 && page.body.includes('Cơ sở Mẫu 1'),
    String(page.status),
  );

  docker(
    'run',
    '-d',
    '--rm',
    '--name',
    containers.admin,
    '-p',
    '127.0.0.1:4101:8080',
    'bepthaymao-admin:dev',
  );
  record('admin /healthz 200', (await get('http://127.0.0.1:4101/healthz')).status === 200);
  const index = await get('http://127.0.0.1:4101/admin/');
  record(
    'admin /admin/ có <base href="/admin/">',
    index.status === 200 && index.body.includes('<base href="/admin/">'),
  );
  record(
    'admin /admin/branches 200 (SPA fallback)',
    (await get('http://127.0.0.1:4101/admin/branches')).status === 200,
  );
  const stylesheet = /href="([^"]+\.css)"/.exec(index.body)?.[1];
  const css = stylesheet
    ? await get(new URL(stylesheet, 'http://127.0.0.1:4101/admin/').href)
    : { body: '' };
  const font = /url\(["']?([^"')]+\.woff2)/.exec(css.body)?.[1];
  const fontStatus = font
    ? (await get(new URL(font, 'http://127.0.0.1:4101/admin/').href)).status
    : 0;
  record('admin font .woff2 200', fontStatus === 200, font ?? 'không thấy font trong CSS');
} catch (error) {
  record('docker smoke chạy hết', false, error.message);
} finally {
  for (const name of Object.values(containers)) docker('rm', '-f', name);
  mock?.kill();
}

for (const { name, ok, detail } of results)
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
process.exitCode = results.every((result) => result.ok) ? 0 : 1;
