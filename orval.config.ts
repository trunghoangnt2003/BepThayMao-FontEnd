import { defineConfig } from 'orval';

// ORVAL_OUT lets api:check generate into a temp directory and diff against the committed client.
const out = process.env['ORVAL_OUT'] ?? 'projects/api-client/src/generated';

// Plain Angular HttpClient output: no wrapper around HTTP calls (D-02, ADR-0008); interceptors live in core.
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
