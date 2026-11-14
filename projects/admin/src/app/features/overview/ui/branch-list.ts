import { Component, input } from '@angular/core';
import { OverviewBranchDto } from '@bepthaymao/api-client';

/** Cơ sở trong phạm vi: số đơn hôm nay, trạng thái bằng chữ, giờ mở cửa. */
@Component({
  selector: 'adm-branch-list',
  template: `
    <ul>
      @for (branch of branches(); track branch.branchId) {
        <li>
          <b>{{ branch.name }}</b>
          <span class="branches__cnt"
            ><b class="num">{{ branch.ordersToday }}</b
            ><span>đơn</span></span
          >
          <small
            ><span [class]="'pill ' + state(branch).tone">{{ state(branch).text }}</span>
            <span class="num">{{ branch.openTime }} đến {{ branch.closeTime }}</span></small
          >
        </li>
      }
    </ul>
  `,
  styleUrl: './branch-list.css',
})
export class BranchListComponent {
  readonly branches = input.required<readonly OverviewBranchDto[]>();

  protected state(branch: OverviewBranchDto): { text: string; tone: string } {
    if (!branch.isActive) return { text: 'Tạm ngưng', tone: 'p-mute' };
    if (!branch.acceptsOrders) return { text: 'Thiếu tài khoản nhận tiền', tone: 'p-err' };
    if (branch.isOpenNow) return { text: 'Đang mở cửa', tone: 'p-ok' };
    return { text: 'Ngoài giờ, nhận đơn hôm sau', tone: 'p-mute' };
  }
}
