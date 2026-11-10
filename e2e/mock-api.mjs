// Contract-shaped stand-in for the backend in frontend CI: GET /api/v1/branches from the fixture,
// everything else a 404 problem+json with correlationId, like the real API.
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

const branches = readFileSync(new URL('./fixtures/public-branches.json', import.meta.url));
const port = Number(process.env['MOCK_API_PORT'] ?? 5080);

createServer((request, response) => {
  const path = new URL(request.url ?? '/', 'http://mock').pathname;
  if (request.method === 'GET' && path === '/api/v1/branches') {
    response.writeHead(200, { 'content-type': 'application/json; charset=utf-8' }).end(branches);
  } else if (path === '/health/ready' || path === '/health/live') {
    response.writeHead(200, { 'content-type': 'text/plain' }).end('Healthy');
  } else {
    const correlationId = randomUUID().replaceAll('-', '');
    response
      .writeHead(404, {
        'content-type': 'application/problem+json',
        'x-correlation-id': correlationId,
      })
      .end(JSON.stringify({ title: 'Not Found', status: 404, correlationId }));
  }
}).listen(port, '127.0.0.1', () => {
  process.stdout.write(`mock API on http://127.0.0.1:${port.toString()}\n`);
});
