import { Component, input } from '@angular/core';
import { OrderDto, OrderStatus } from '@bepthaymao/api-client';
import { formatVnd, STATUS_LABELS } from '../../shop-admin/data-access/shop-admin.service';
import { formatClock } from '../data-access/overview-model';

const STATUS_PILL: Partial<Record<OrderStatus, string>> = {
  PendingPayment: 'pill p-warn',
  Completed: 'pill p-ok',
  Cancelled: 'pill p-mute',
};

/** Năm đơn mới nhất trong phạm vi. */
@Component({
  selector: 'adm-latest-orders',
  template: `
    @if (orders().length === 0) {
      <p class="empty">Chưa có đơn nào.</p>
    } @else {
      <div class="tablewrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Đơn</th>
              <th scope="col" class="right">Tiền món</th>
              <th scope="col">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            @for (order of orders(); track order.id) {
              <tr>
                <td>
                  <code class="code">{{ order.code }}</code
                  ><small class="num"
                    >{{ formatClock(order.createdAt) }}, {{ order.branchName }}</small
                  >
                </td>
                <td class="right num strong">{{ formatVnd(order.itemsTotal) }}</td>
                <td>
                  <span [class]="pill(order.status)">{{ labels[order.status] }}</span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styleUrl: './latest-orders.css',
})
export class LatestOrdersComponent {
  readonly orders = input.required<readonly OrderDto[]>();
  protected readonly labels = STATUS_LABELS;
  protected readonly formatVnd = formatVnd;
  protected readonly formatClock = formatClock;

  protected pill(status: OrderStatus): string {
    return STATUS_PILL[status] ?? 'pill p-blue';
  }
}
