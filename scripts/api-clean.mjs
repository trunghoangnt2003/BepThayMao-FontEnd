import { rmSync } from 'node:fs';
rmSync('projects/api-client/src/generated', { recursive: true, force: true });
