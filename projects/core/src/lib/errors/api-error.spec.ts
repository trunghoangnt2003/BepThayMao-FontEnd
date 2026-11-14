import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { isApiError, toApiError } from './api-error';

describe('API errors', () => {
  it('reads problem details and the correlation identifier', () => {
    const result = toApiError(
      new HttpErrorResponse({
        status: 400,
        error: { title: 'Invalid', errors: { name: ['Required'] }, correlationId: 'body-id' },
        headers: new HttpHeaders({ 'X-Correlation-Id': 'header-id' }),
      }),
    );
    expect(result).toEqual({
      kind: 'http',
      status: 400,
      title: 'Invalid',
      errors: { name: ['Required'] },
      correlationId: 'body-id',
    });
    expect(isApiError(result)).toBe(true);
  });

  it('falls back to the response header and rejects malformed fields', () => {
    const result = toApiError(
      new HttpErrorResponse({
        status: 500,
        error: { title: {}, detail: 42, errors: { name: 'wrong-shape' } },
        headers: new HttpHeaders({ 'X-Correlation-Id': 'header-id' }),
      }),
    );
    expect(result).toEqual({ kind: 'http', status: 500, correlationId: 'header-id' });
  });

  it('handles network failures and unknown exceptions without exposing them', () => {
    expect(toApiError(new HttpErrorResponse({ status: 0 }))).toEqual({
      kind: 'network',
      status: 0,
    });
    expect(toApiError(new Error('private details'))).toEqual({ kind: 'network', status: 0 });
    expect(toApiError(null)).toEqual({ kind: 'network', status: 0 });
  });

  it('keeps already-normalized errors and string problem details', () => {
    const known = { kind: 'http' as const, status: 404, title: 'Not found' };
    expect(toApiError(known)).toBe(known);
    expect(
      toApiError(new HttpErrorResponse({ status: 409, error: { detail: 'Conflict' } })).detail,
    ).toBe('Conflict');
    expect(
      toApiError(new HttpErrorResponse({ status: 503, error: '<html>down</html>' })).status,
    ).toBe(503);
  });

  it.each([
    null,
    {},
    [],
    { kind: 'network', status: 500 },
    { kind: 'http', status: 0 },
    { kind: 'http', status: '400' },
  ])('rejects an invalid normalized error: %s', (value: unknown) => {
    expect(isApiError(value)).toBe(false);
  });
});

describe('API errors for order conflicts', () => {
  it('keeps the unavailable dish ids of an order conflict and drops non-string ids', () => {
    const result = toApiError(
      new HttpErrorResponse({
        status: 409,
        error: { title: 'Món đang hết', unavailableDishIds: ['d1', 7, 'd2'] },
      }),
    );
    expect(result).toEqual({
      kind: 'http',
      status: 409,
      title: 'Món đang hết',
      unavailableDishIds: ['d1', 'd2'],
    });
  });
});
