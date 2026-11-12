import { safeReturnUrl } from './safe-return-url';

describe('safeReturnUrl', () => {
  it('keeps internal route and query', () => {
    expect(safeReturnUrl('/owner/branches?x=1')).toBe('/owner/branches?x=1');
  });
  it.each([
    '//evil.example.com',
    '/\\evil',
    'https://evil.example.com',
    'javascript:alert(1)',
    '',
    null,
  ])('rejects external or empty destination %s', (raw) => {
    expect(safeReturnUrl(raw)).toBeNull();
  });
});
