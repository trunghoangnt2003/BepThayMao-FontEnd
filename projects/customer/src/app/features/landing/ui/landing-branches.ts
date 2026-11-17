import { Component, input } from '@angular/core';
import { PublicBranch } from '@bepthaymao/api-client';
import { formatOpeningHours } from '@bepthaymao/ui';

/** Các cơ sở đang hoạt động: tên, giờ nhận đơn, địa chỉ (dữ liệu thật từ API cơ sở). */
@Component({
  selector: 'cus-landing-branches',
  template: `
    <ul class="br-grid">
      @for (branch of branches(); track branch.id) {
        <li class="br">
          <h3>{{ branch.name }}</h3>
          <span class="pill num">Nhận đơn {{ hours(branch) }}</span>
          <p>
            <svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            {{ branch.address }}
          </p>
        </li>
      }
    </ul>
  `,
  styles: `
    :host {
      display: block;
    }
    .br-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 16px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .br {
      display: grid;
      gap: 8px;
      min-width: 0;
      padding: 18px;
      border: 1px solid var(--lp-line);
      border-radius: 16px;
      background: var(--lp-surface);
      box-shadow: var(--lp-shadow);
    }
    h3 {
      margin: 0;
      color: var(--lp-red);
      font-family: var(--lp-font-sign);
      font-size: 22px;
      font-weight: 700;
    }
    .pill {
      justify-self: start;
      padding: 2px 10px;
      border-radius: 999px;
      background: var(--lp-ok-bg);
      color: var(--lp-ok);
      font-size: 13px;
      font-weight: 700;
    }
    p {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin: 0;
      color: var(--lp-ink-2);
      overflow-wrap: anywhere;
    }
    .ic {
      flex: none;
      width: 20px;
      height: 20px;
      fill: none;
      stroke: currentcolor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    @media (min-width: 47.5rem) {
      .br-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `,
})
export class LandingBranches {
  readonly branches = input.required<readonly PublicBranch[]>();

  protected hours(branch: PublicBranch): string {
    return formatOpeningHours(branch.openTime, branch.closeTime);
  }
}
