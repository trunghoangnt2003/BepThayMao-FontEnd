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
      border: 1px solid var(--color-rule);
      border-radius: var(--radius-card);
      background: var(--color-paper-2);
    }
    b {
      color: var(--color-accent);
      font-size: 1.25rem;
      font-weight: var(--weight-heavy);
    }
    span {
      color: var(--color-ink-2);
      font-size: var(--text-sm);
    }
    a {
      justify-self: start;
      color: var(--gold);
      font-weight: var(--weight-strong);
    }
    a:focus-visible {
      outline: 2px solid var(--color-focus);
      outline-offset: 3px;
    }
  `,
})
export class LandingBranches {
  readonly branches = input.required<readonly PublicBranch[]>();

  protected hours(branch: PublicBranch): string {
    return formatOpeningHours(branch.openTime, branch.closeTime);
  }
}
