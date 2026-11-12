import { spawnSync } from 'node:child_process';
import { setTimeout } from 'node:timers/promises';
const containers = [];
function docker(args) {
  const result = spawnSync('docker', args, { encoding: 'utf8' });
  if (result.error || result.status !== 0) throw new Error(`Docker ${args[0]} failed.`);
  return result.stdout.trim();
}
try {
  for (const [target, port, internal] of [
    ['customer', 14001, 4000],
    ['admin', 18081, 8080],
  ]) {
    const image = `bepthaymao-${target}:dev`;
    const user = docker(['image', 'inspect', '--format', '{{.Config.User}}', image]);
    if (!user || ['0', 'root', '0:0'].includes(user)) throw new Error(`${target} is root.`);
    const name = `bep-smoke-${target}-${Date.now()}`;
    containers.push(name);
    docker([
      'run',
      '-d',
      '--name',
      name,
      '--add-host',
      'host.docker.internal:host-gateway',
      '-p',
      `127.0.0.1:${port}:${internal}`,
      '-e',
      'NG_ALLOWED_HOSTS=localhost,127.0.0.1',
      '-e',
      'API_INTERNAL_URL=http://host.docker.internal:5080',
      image,
    ]);
    let ready = false;
    for (let index = 0; index < 60; index++) {
      try {
        ready = (await fetch(`http://127.0.0.1:${port}/healthz`)).ok;
      } catch {
        /* Bounded container startup wait. */
      }
      if (ready) break;
      await setTimeout(500);
    }
    if (!ready) throw new Error(`${target} health failed.`);
    const response = await fetch(
      `http://127.0.0.1:${port}/${target === 'admin' ? 'admin/branches' : 'co-so'}`,
    );
    const html = await response.text();
    if (
      !response.ok ||
      !html.includes(target === 'admin' ? '<base href="/admin/">' : 'Cơ sở Mẫu 1')
    )
      throw new Error(`${target} page failed.`);
  }
  console.log('Customer SSR, admin SPA fallback and health endpoints pass; both images non-root.');
} finally {
  for (const name of containers) spawnSync('docker', ['rm', '-f', name], { stdio: 'ignore' });
}
