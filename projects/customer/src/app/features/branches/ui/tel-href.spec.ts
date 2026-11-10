import { toTelHref } from './tel-href';

describe('toTelHref', () => {
  it('converts a leading 0 to +84 and strips spaces and dots', () => {
    expect(toTelHref('0280 000 0001')).toBe('tel:+842800000001');
    expect(toTelHref('0901.234.567')).toBe('tel:+84901234567');
  });

  it('keeps an existing +84 prefix', () => {
    expect(toTelHref('+84901234567')).toBe('tel:+84901234567');
  });
});
