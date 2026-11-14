import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LegalService, slugOf } from '../data-access/legal.service';

function viDate(value: string): string {
  const [year, month, day] = value.split('-');
  return day && month && year ? `${day}/${month}/${year}` : value;
}

/**
 * Chân trang: thông tin người bán, chính sách và biểu tượng "Đã thông báo Bộ Công Thương" theo quy định
 * thương mại điện tử. Chỉ hiện mục chủ quán đã nhập ở admin, không điền thay.
 */
@Component({
  selector: 'cus-site-footer',
  imports: [RouterLink],
  template: `
    @let info = legal();
    <div class="container grid">
      <div class="brand">
        <b>Bếp Thầy Mão</b>
        <span>Xôi nóng giao tận nơi</span>
        @if (info?.moitNoticeUrl; as url) {
          <a class="moit" [href]="url" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
            Đã thông báo Bộ Công Thương
          </a>
        }
      </div>
      @if (seller(); as rows) {
        <section aria-labelledby="ft-seller">
          <h2 id="ft-seller">Thông tin người bán</h2>
          <dl>
            @for (row of rows; track row.label) {
              <div>
                <dt>{{ row.label }}</dt>
                <dd>
                  @if (row.href) {
                    <a [href]="row.href">{{ row.value }}</a>
                  } @else {
                    {{ row.value }}
                  }
                </dd>
              </div>
            }
          </dl>
        </section>
      }
      <nav aria-labelledby="ft-links">
        <h2 id="ft-links">Đặt xôi</h2>
        <a routerLink="/dat-mon">Đặt món</a>
        <a routerLink="/tra-don">Tra cứu đơn</a>
        <a routerLink="/co-so">Các cơ sở</a>
      </nav>
      @if (info && info.policies.length > 0) {
        <nav aria-labelledby="ft-policy">
          <h2 id="ft-policy">Chính sách</h2>
          @for (policy of info.policies; track policy.kind) {
            <a [routerLink]="['/chinh-sach', slugOf(policy.kind)]">{{ policy.title }}</a>
          }
        </nav>
      }
    </div>
    <p class="container copy">© {{ year }} {{ info?.businessName || 'Bếp Thầy Mão' }}</p>
  `,
  styles: `
    :host {
      display: block;
      margin-top: var(--space-2xl);
      padding-block: var(--space-xl) calc(var(--space-lg) + env(safe-area-inset-bottom, 0px));
      background: var(--cocoa);
      color: var(--on-cocoa-2);
      font-size: var(--text-sm);
    }
    .grid {
      display: grid;
      gap: var(--space-xl);
    }
    .brand {
      display: grid;
      gap: var(--space-2xs);
      align-content: start;
    }
    .brand b {
      color: var(--on-cocoa);
      font-size: var(--text-lg);
    }
    h2 {
      margin-bottom: var(--space-xs);
      color: var(--gold);
      font-size: 0.75rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    nav {
      display: grid;
      align-content: start;
    }
    nav a,
    dd a {
      display: inline-flex;
      align-items: center;
      min-height: 40px;
      color: var(--on-cocoa);
      text-decoration: none;
    }
    nav a:hover,
    dd a:hover {
      text-decoration: underline;
    }
    dl {
      display: grid;
      gap: var(--space-xs);
      margin: 0;
    }
    dt {
      color: var(--on-cocoa-2);
      font-size: 0.75rem;
    }
    dd {
      margin: 0;
      color: var(--on-cocoa);
      overflow-wrap: anywhere;
    }
    .moit {
      justify-self: start;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 40px;
      margin-top: var(--space-sm);
      padding-inline: 14px;
      border-radius: var(--radius-pill);
      background: oklch(97% 0.015 80 / 0.1);
      color: var(--on-cocoa);
      font-weight: var(--weight-strong);
      text-decoration: none;
    }
    .moit svg {
      width: 16px;
      height: 16px;
      fill: none;
      stroke: var(--la);
      stroke-width: 2.4;
    }
    .copy {
      margin-top: var(--space-xl);
      padding-top: var(--space-md);
      border-top: 1px solid oklch(97% 0.015 80 / 0.12);
    }
    @media (min-width: 56rem) {
      .grid {
        grid-template-columns: 1.1fr 1.4fr 0.8fr 1fr;
      }
    }
  `,
})
export class SiteFooter {
  protected readonly legal = toSignal(inject(LegalService).footer(), { initialValue: null });
  protected readonly slugOf = slugOf;
  protected readonly year = new Date().getFullYear();

  /** Chỉ những dòng chủ quán đã nhập; không có dòng nào thì ẩn cả mục. */
  protected readonly seller = computed(() => {
    const info = this.legal();
    if (!info) return null;
    const registration = [
      info.registrationNumber,
      info.registrationIssuedOn ? `cấp ngày ${viDate(info.registrationIssuedOn)}` : null,
      info.registrationIssuedBy ? `tại ${info.registrationIssuedBy}` : null,
    ]
      .filter(Boolean)
      .join(', ');
    const rows = [
      { label: 'Người bán', value: info.businessName, href: null },
      { label: 'Giấy chứng nhận ĐKKD / Mã số thuế', value: registration || null, href: null },
      { label: 'Địa chỉ', value: info.address, href: null },
      {
        label: 'Điện thoại',
        value: info.phone,
        href: info.phone ? `tel:${info.phone.replace(/\s/g, '')}` : null,
      },
      { label: 'Email', value: info.email, href: info.email ? `mailto:${info.email}` : null },
    ].filter((row): row is { label: string; value: string; href: string | null } => !!row.value);
    return rows.length > 0 ? rows : null;
  });
}
