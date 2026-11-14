import { OverviewActivityKind } from '@bepthaymao/api-client';

/** Một điểm trên biểu đồ một chuỗi. */
export interface ChartPoint {
  readonly label: string;
  readonly value: number;
}

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as const;

export function hourPoints(firstHour: number, counts: readonly number[]): ChartPoint[] {
  return counts.map((value, index) => ({
    label: `${String(firstHour + index).padStart(2, '0')}h`,
    value,
  }));
}

/** Nhãn ngày ngắn từ chuỗi yyyy-MM-dd; ngày cuối là hôm nay. */
export function dayLabel(date: string, isToday: boolean): string {
  if (isToday) return 'Hôm nay';
  return WEEKDAYS[new Date(`${date}T00:00:00Z`).getUTCDay()] ?? date;
}

/** Đỉnh trục tròn số để vạch lưới chia đều 4 phần. */
export function niceTop(max: number, kind: 'count' | 'money'): number {
  if (kind === 'count') return Math.max(4, Math.ceil(max / 4) * 4);
  if (max <= 0) return 100_000;
  const step = 10 ** Math.floor(Math.log10(max));
  return Math.ceil(max / step) * step;
}

export function percent(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

export function formatAxis(value: number, kind: 'count' | 'money'): string {
  if (kind === 'count') return String(Math.round(value));
  return value >= 1_000_000
    ? `${String(Math.round(value / 100_000) / 10).replace('.', ',')}tr`
    : `${String(Math.round(value / 1000))}k`;
}

export function formatClock(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value));
}

export const ACTIVITY_TONE: Record<
  OverviewActivityKind,
  { icon: 'orders' | 'check' | 'prohibit'; tone: string }
> = {
  OrderCreated: { icon: 'orders', tone: '' },
  OrderPaid: { icon: 'check', tone: 'ok' },
  OrderCancelled: { icon: 'prohibit', tone: 'muted' },
  DishSoldOut: { icon: 'prohibit', tone: 'warn' },
};
