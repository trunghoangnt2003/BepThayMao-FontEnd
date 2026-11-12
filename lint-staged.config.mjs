import { relative } from 'node:path';
function commands(command, files) {
  const source = files
    .map((file) => relative(process.cwd(), file).replaceAll('\\', '/'))
    .filter(
      (file) =>
        !/^(projects\/api-client\/src\/generated|openapi|playwright-report|test-results)\//.test(
          file,
        ) && file !== 'package-lock.json',
    );
  const result = [];
  for (let offset = 0; offset < source.length; offset += 10) {
    result.push(
      `${command} ${source
        .slice(offset, offset + 10)
        .map((file) => `"${file}"`)
        .join(' ')}`,
    );
  }
  return result;
}
export default {
  '*.{ts,html}': (files) => commands('eslint --max-warnings 0', files),
  '*.{ts,html,css,json,mjs,md}': (files) => commands('prettier --check', files),
};
