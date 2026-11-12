import { defineConfig } from 'orval';
const out = process.env['ORVAL_OUT'] ?? 'projects/api-client/src/generated';
export default defineConfig({
  bepthaymao: {
    input: { target: 'openapi/v1.json' },
    output: {
      mode: 'tags-split',
      client: 'angular',
      target: `${out}/endpoints`,
      schemas: `${out}/models`,
      clean: true,
    },
  },
});
