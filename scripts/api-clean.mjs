// Removes the generated client so api:generate starts from scratch (cross-platform rm -rf).
import { rmSync } from 'node:fs';

rmSync('projects/api-client/src/generated', { recursive: true, force: true });
console.log('Đã xóa projects/api-client/src/generated.');
