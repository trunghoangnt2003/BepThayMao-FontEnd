import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function checkFonts(mediaDirectory) {
  const files = readdirSync(mediaDirectory);
  const required = [
    'be-vietnam-pro-vietnamese-400',
    'be-vietnam-pro-vietnamese-600',
    'be-vietnam-pro-vietnamese-700',
    'be-vietnam-pro-vietnamese-800',
  ];
  for (const font of required) {
    if (!files.some((file) => file.startsWith(font) && file.endsWith('.woff2'))) {
      throw new Error(`Thiếu font tiếng Việt ${font} trong ${mediaDirectory}`);
    }
  }
  return required.length;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    for (const app of ['customer', 'admin']) {
      const count = checkFonts(resolve('dist', app, 'browser', 'media'));
      console.log(`${app}: ${count} font tiếng Việt tự host đã phát ra.`);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
