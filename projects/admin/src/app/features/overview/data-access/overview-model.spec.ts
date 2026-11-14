import { dayLabel, formatAxis, hourPoints, niceTop, percent } from './overview-model';

describe('overview model', () => {
  it('labels hours from the first hour', () => {
    expect(hourPoints(6, [1, 0, 3]).map((point) => point.label)).toEqual(['06h', '07h', '08h']);
  });

  it('labels weekdays in Vietnamese and today last', () => {
    expect(dayLabel('2026-11-09', false)).toBe('T2');
    expect(dayLabel('2026-11-15', false)).toBe('CN');
    expect(dayLabel('2026-11-14', true)).toBe('Hôm nay');
  });

  it('rounds axis tops so empty data still draws', () => {
    expect(niceTop(0, 'count')).toBe(4);
    expect(niceTop(9, 'count')).toBe(12);
    expect(niceTop(0, 'money')).toBe(100_000);
    expect(niceTop(1_385_000, 'money')).toBe(2_000_000);
    expect(niceTop(85_000, 'money')).toBe(90_000);
  });

  it('formats axes and percentages without dividing by zero', () => {
    expect(formatAxis(250_000, 'money')).toBe('250k');
    expect(formatAxis(1_500_000, 'money')).toBe('1,5tr');
    expect(percent(36, 42)).toBe(86);
    expect(percent(0, 0)).toBe(0);
  });
});
