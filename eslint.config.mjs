import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import boundaries from 'eslint-plugin-boundaries';
import security from 'eslint-plugin-security';

const appTypes = ['customer', 'admin'];
const elements = appTypes.flatMap((app) => [
  { type: `${app}-data-access`, pattern: `projects/${app}/src/app/features/*/data-access/**` },
  { type: `${app}-view`, pattern: `projects/${app}/src/app/features/*/{pages,ui}/**` },
  { type: app, pattern: `projects/${app}/src/**` },
]);
elements.push(
  { type: 'api-endpoints', pattern: 'projects/api-client/src/generated/endpoints/**' },
  { type: 'api-client', pattern: 'projects/api-client/src/**' },
  { type: 'core', pattern: 'projects/core/src/**' },
  { type: 'ui', pattern: 'projects/ui/src/**' },
);
const policy = (from, to) => ({
  from: { element: { type: from } },
  allow: { to: { element: { types: to } } },
});
const policies = appTypes.flatMap((app) => [
  policy(`${app}-view`, [app, `${app}-view`, `${app}-data-access`, 'api-client', 'core', 'ui']),
  policy(`${app}-data-access`, [`${app}-data-access`, 'api-endpoints', 'api-client', 'core']),
  policy(app, [app, `${app}-view`, `${app}-data-access`, 'api-client', 'core', 'ui']),
]);
policies.push(
  policy('core', ['core', 'api-client', 'api-endpoints']),
  policy('ui', ['ui', 'api-client']),
  policy('api-client', ['api-client', 'api-endpoints']),
  policy('api-endpoints', ['api-client', 'api-endpoints']),
);

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      '.angular/**',
      'coverage/**',
      'node_modules/**',
      'projects/api-client/src/generated/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  {
    files: ['**/*.ts'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      ...angular.configs.tsRecommended,
    ],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    processor: angular.processInlineTemplates,
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    plugins: { boundaries },
    settings: {
      'boundaries/elements': elements,
      'import/resolver': { typescript: { project: './tsconfig.json' } },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': true,
          'ts-nocheck': true,
          'ts-expect-error': 'allow-with-description',
          minimumDescriptionLength: 10,
        },
      ],
      'no-console': 'error',
      complexity: ['error', 10],
      'max-lines-per-function': ['error', { max: 60, skipBlankLines: true, skipComments: true }],
      'boundaries/dependencies': ['error', { default: 'disallow', policies }],
    },
  },
  {
    files: ['projects/customer/src/app/**/*.ts', 'projects/admin/src/app/**/*.ts'],
    ignores: ['projects/*/src/app/features/*/data-access/**'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@angular/common/http',
              importNames: ['HttpClient'],
              message: 'Component không gọi HttpClient; dùng service data-access (FR-026).',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'projects/core/src/**/*.ts',
      'projects/*/src/app/features/*/data-access/**/*.ts',
      'projects/customer/src/server.ts',
    ],
    plugins: { security },
    rules: security.configs.recommended.rules,
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
  },
);
