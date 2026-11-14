import { Component, computed, input, signal } from '@angular/core';
import { ChartPoint, formatAxis, niceTop } from '../data-access/overview-model';

const W = 640;
const H = 240;
const PAD = { left: 44, right: 12, top: 12, bottom: 28 } as const;

interface Mark {
  readonly x: number;
  readonly y: number;
  readonly left: number;
  readonly label: string;
  readonly value: number;
}

/** Biểu đồ một chuỗi: vùng (đơn theo giờ) hoặc cột (7 ngày). Có tooltip khi rê và chế độ bảng cho trình đọc màn hình. */
@Component({
  selector: 'adm-trend-chart',
  templateUrl: './trend-chart.html',
  styleUrl: './trend-chart.css',
})
export class TrendChartComponent {
  readonly points = input.required<readonly ChartPoint[]>();
  readonly kind = input<'area' | 'bar'>('area');
  readonly unit = input<'count' | 'money'>('count');
  readonly label = input.required<string>();
  readonly asTable = input(false);
  readonly format = input.required<(value: number) => string>();

  protected readonly W = W;
  protected readonly H = H;
  protected readonly baseline = H - PAD.bottom;
  protected readonly hovered = signal<Mark | null>(null);

  private readonly top = computed(() =>
    niceTop(Math.max(0, ...this.points().map((point) => point.value)), this.unit()),
  );
  private readonly step = computed(
    () => (W - PAD.left - PAD.right) / Math.max(1, this.points().length),
  );

  protected readonly ticks = computed(() =>
    [0, 1, 2, 3, 4].map((index) => {
      const value = (this.top() * index) / 4;
      return { y: this.y(value), text: formatAxis(value, this.unit()) };
    }),
  );

  protected readonly marks = computed<Mark[]>(() =>
    this.points().map((point, index) => ({
      x: PAD.left + this.step() * index + this.step() / 2,
      y: this.y(point.value),
      left: PAD.left + this.step() * index,
      label: point.label,
      value: point.value,
    })),
  );

  protected readonly linePath = computed(() =>
    this.marks()
      .map((mark, index) => `${index ? 'L' : 'M'}${mark.x.toFixed(1)} ${mark.y.toFixed(1)}`)
      .join(' '),
  );

  protected readonly areaPath = computed(() => {
    const marks = this.marks();
    if (marks.length === 0) return '';
    const first = marks[0];
    const last = marks[marks.length - 1];
    return `${this.linePath()} L${last.x.toFixed(1)} ${String(this.baseline)} L${first.x.toFixed(1)} ${String(this.baseline)} Z`;
  });

  protected readonly bars = computed(() => {
    const width = Math.min(36, this.step() * 0.56);
    return this.marks().map((mark) => {
      const left = mark.x - width / 2;
      const height = this.baseline - mark.y;
      if (height <= 0) return '';
      const radius = Math.min(4, height);
      return `M${left.toFixed(1)} ${String(this.baseline)} V${(mark.y + radius).toFixed(1)} q0 -${String(radius)} ${String(radius)} -${String(radius)} h${(width - 2 * radius).toFixed(1)} q${String(radius)} 0 ${String(radius)} ${String(radius)} V${String(this.baseline)} Z`;
    });
  });

  protected readonly hitWidth = computed(() => this.step());

  /** Nhãn trục ngang: biểu đồ vùng nhiều điểm chỉ ghi cách một mốc để không chồng chữ. */
  protected showLabel(index: number): boolean {
    return this.kind() === 'bar' || this.points().length <= 8 || index % 2 === 0;
  }

  private y(value: number): number {
    return PAD.top + (H - PAD.top - PAD.bottom) * (1 - value / this.top());
  }
}
