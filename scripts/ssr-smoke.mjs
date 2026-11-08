import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { get } from 'node:http';
import { once } from 'node:events';

const reservation = createServer();
reservation.listen(0, '127.0.0.1');
await once(reservation, 'listening');
const address = reservation.address();
if (!address || typeof address === 'string') throw new Error('Không chọn được cổng kiểm SSR.');
const port = address.port;
await new Promise((done) => {
  reservation.close(done);
});

const child = spawn(process.execPath, ['dist/customer/server/server.mjs'], {
  env: { ...process.env, PORT: String(port), NG_ALLOWED_HOSTS: 'localhost,127.0.0.1' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let logs = '';
child.stdout.on('data', (chunk) => {
  logs += chunk.toString();
});
child.stderr.on('data', (chunk) => {
  logs += chunk.toString();
});
const origin = `http://127.0.0.1:${port}`;
try {
  let ready = false;
  for (let index = 0; index < 50; index += 1) {
    if (child.exitCode !== null) throw new Error(`SSR không khởi động: ${logs}`);
    try {
      const health = await fetch(`${origin}/healthz`, { signal: AbortSignal.timeout(1000) });
      if (health.ok) {
        ready = true;
        break;
      }
    } catch {
      /* Chỉ chờ server do chính kiểm tra này khởi chạy. */
    }
    await new Promise((done) => {
      setTimeout(done, 200);
    });
  }
  assert.ok(ready, `SSR không sẵn sàng: ${logs}`);
  const response = await fetch(`${origin}/khong-co`);
  assert.equal(response.status, 404);
  const html = await response.text();
  for (const text of [
    'Không tìm thấy trang',
    'Bỏ qua tới nội dung chính',
    'Bếp Thầy Mão',
    'rel="canonical"',
    'noindex',
  ]) {
    assert.ok(html.includes(text), `HTML SSR thiếu ${text}: ${logs}`);
  }
  const untrustedStatus = await new Promise((done, reject) => {
    get(`${origin}/khong-co`, { headers: { Host: 'evil.example' } }, (response) => {
      response.resume();
      done(response.statusCode);
    }).on('error', reject);
  });
  assert.equal(untrustedStatus, 400);
  console.log(
    'SSR PASS: health 200, 404 có nội dung/metadata tiếng Việt trong HTML thô, Host lạ 400.',
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  child.kill();
}
