export default {
  '*.{ts,html}': 'eslint --max-warnings 0 --no-warn-ignored',
  '*.{ts,html,css,json,mjs,md}': 'prettier --check',
};
