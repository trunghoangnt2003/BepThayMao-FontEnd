import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { BranchResponse, OrderDto, OrderStatus } from '@bepthaymao/api-client';
import { HlmButton } from '@bepthaymao/ui';
import {
  formatTime,
  formatVnd,
  ShopAdminService,
  STATUS_LABELS,
} from '../data-access/shop-admin.service';

const STATUSES = Object.keys(STATUS_LABELS) as OrderStatus[];

@Component({
  selector: 'adm-orders-page',
  imports: [FormsModule, HlmButton],
  templateUrl: './orders-page.html',
  styleUrl: './shop-admin.css',
})
export class OrdersPage {
  protected readonly service = inject(ShopAdminService);
  private readonly destroy = inject(DestroyRef);
  protected readonly labels = STATUS_LABELS;
  protected readonly statuses = STATUSES;
  protected readonly formatVnd = formatVnd;
  protected readonly formatTime = formatTime;
  protected readonly branches = signal<readonly BranchResponse[]>([]);
  protected readonly orders = signal<readonly OrderDto[]>([]);
  protected readonly state = signal<'loading' | 'loaded' | 'error'>('loading');
  protected readonly selected = signal<OrderDto | null>(null);
  protected branchId = '';
  protected status: OrderStatus | '' = '';

  constructor() {
    this.service
      .branches()
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (branches) => {
          this.branches.set(branches);
        },
      });
    this.load();
  }

  protected load(): void {
    this.state.set('loading');
    this.selected.set(null);
    this.service
      .orders(this.branchId || null, this.status || null)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (orders) => {
          this.orders.set(orders);
          this.state.set('loaded');
        },
        error: () => {
          this.state.set('error');
        },
      });
  }

  protected items(order: OrderDto): string {
    return order.items.map((item) => `${item.dishName} × ${String(item.quantity)}`).join(', ');
  }

  protected pillClass(order: OrderDto): string {
    if (order.status === 'Completed') return 'pill pill--ok';
    if (order.status === 'Paid') return 'pill pill--accent';
    return 'pill';
  }
}
