import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { BranchResponse, OrderDto, OverviewDto } from '@bepthaymao/api-client';
import { HlmButton } from '@bepthaymao/ui';
import { LineIconComponent } from '../../../shared/icon/line-icon';
import { dayLabel, hourPoints } from '../data-access/overview-model';
import { OverviewService } from '../data-access/overview.service';
import { formatVnd, ShopAdminService } from '../../shop-admin/data-access/shop-admin.service';
import { ActivityTimelineComponent } from '../ui/activity-timeline';
import { BranchListComponent } from '../ui/branch-list';
import { LatestOrdersComponent } from '../ui/latest-orders';
import { PaidRingComponent } from '../ui/paid-ring';
import { SparklineComponent } from '../ui/sparkline';
import { TopDishesComponent } from '../ui/top-dishes';
import { TrendChartComponent } from '../ui/trend-chart';

/** Tổng quan hôm nay, số liệu thật từ API (không số liệu mẫu). */
@Component({
  selector: 'adm-overview-page',
  imports: [
    RouterLink,
    HlmButton,
    LineIconComponent,
    SparklineComponent,
    TrendChartComponent,
    ActivityTimelineComponent,
    PaidRingComponent,
    TopDishesComponent,
    BranchListComponent,
    LatestOrdersComponent,
  ],
  templateUrl: './overview-page.html',
  styleUrl: './overview-page.css',
})
export class OverviewPage {
  protected readonly admin = inject(ShopAdminService);
  private readonly service = inject(OverviewService);
  private readonly destroy = inject(DestroyRef);

  protected readonly base = this.admin.isOwner() ? '/owner' : '/manager';
  protected readonly branches = signal<readonly BranchResponse[]>([]);
  protected readonly branchId = signal('');
  protected readonly data = signal<OverviewDto | null>(null);
  protected readonly latest = signal<readonly OrderDto[]>([]);
  protected readonly state = signal<'loading' | 'loaded' | 'error'>('loading');
  protected readonly hoursAsTable = signal(false);
  protected readonly weekAsTable = signal(false);

  protected readonly formatVnd = formatVnd;
  protected readonly formatOrders = (value: number): string => `${String(value)} đơn`;

  protected readonly scope = computed(() => {
    const id = this.branchId();
    return id ? (this.branches().find((branch) => branch.id === id)?.name ?? 'Một cơ sở') : '';
  });
  protected readonly hours = computed(() => {
    const data = this.data();
    return data ? hourPoints(data.firstHour, data.ordersByHour) : [];
  });
  protected readonly week = computed(() => {
    const days = this.data()?.days ?? [];
    return days.map((day, index) => ({
      label: dayLabel(day.date, index === days.length - 1),
      value: day.paidAmount,
    }));
  });
  protected readonly orderTrend = computed(() =>
    (this.data()?.days ?? []).map((day) => day.orders),
  );
  protected readonly paidTrend = computed(() =>
    (this.data()?.days ?? []).map((day) => day.paidAmount),
  );
  protected readonly orderRange = computed(() => {
    const trend = this.orderTrend();
    return trend.length ? { min: Math.min(...trend), max: Math.max(...trend) } : null;
  });

  constructor() {
    this.admin
      .branches()
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (branches) => {
          this.branches.set(branches);
        },
      });
    this.load();
  }

  protected selectBranch(id: string): void {
    this.branchId.set(id);
    this.load();
  }

  protected load(): void {
    this.state.set('loading');
    const branchId = this.branchId() || null;
    this.service
      .load(branchId)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (data) => {
          this.data.set(data);
          this.state.set('loaded');
        },
        error: () => {
          this.state.set('error');
        },
      });
    this.admin
      .orders(branchId, null)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (orders) => {
          this.latest.set(orders.slice(0, 5));
        },
      });
  }

  protected soldOutNote(data: OverviewDto): string {
    if (data.soldOut.length === 0) return 'Mọi món đang bán ở mọi cơ sở';
    const names = data.soldOut
      .slice(0, 2)
      .map((item) => `${item.dishName} ở ${item.branchName}`)
      .join(', ');
    return data.soldOut.length > 2
      ? `${names} và ${String(data.soldOut.length - 2)} món khác`
      : names;
  }
}
