import { formatOpeningHours } from './format-opening-hours';

describe('formatOpeningHours', () => {
  it('joins hours with accessible Vietnamese text', () => {
    expect(formatOpeningHours('06:00', '21:30')).toBe('06:00 đến 21:30');
  });
  it('removes optional seconds without changing hours', () => {
    expect(formatOpeningHours('06:00:00', '21:30:00')).toBe('06:00 đến 21:30');
  });
});
