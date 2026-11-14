import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PublicBranch } from '@bepthaymao/api-client';
import { formatOpeningHours } from '@bepthaymao/ui';

/** Các cơ sở đang hoạt động: tên, địa chỉ, giờ nhận đơn (dữ liệu thật từ API cơ sở). */
@Component({
  selector: 'cus-landing-branches',
  imports: [RouterLink],
  template: `
    <ul>
      @for (branch of branches(); track branch.id) {
        <li>
          <b>{{ branch.name }}</b>
          <span>{{ branch.address }}</span>
          <span class="num">Nhận đơn {{ hours(branch) }}</span>
        </li>
      }
    </ul>
    <a routerLink="/co-so">Xem giờ và bản đồ các cơ sở</a>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--space-md);
    }
    ul {
      display: grid;
      gap: var(--space-sm);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li {
      display: grid;
      gap: 2px;
      padding: var(--space-md) var(--space-lg);
      border-radius: var(--radius-card);
      background: oklch(97% 0.015 80 / 0.08);
      box-shadow: inset 0 0 0 1px oklch(97% 0.015 80 / 0.12);
    }
    b {
      font-size: 1.25rem;
      font-weight: var(--weight-heavy);
    }
    span {
      color: var(--on-cocoa-2);
      font-size: var(--text-sm);
    }
    a {
      justify-self: start;
      color: var(--gold);
      font-weight: var(--weight-strong);
    }
  `,
})
export class LandingBranches {
  readonly branches = input.required<readonly PublicBranch[]>();

  protected hours(branch: PublicBranch): string {
    return formatOpeningHours(branch.openTime, branch.closeTime);
  }
}
