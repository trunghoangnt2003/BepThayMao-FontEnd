import { Component, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PolicyDto } from '@bepthaymao/api-client';
import { PageMeta } from '../../../shared/seo/page-meta';
import { Loaded } from '../../shop/data-access/shop-data';

function viDateTime(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value));
}

/** Một trang chính sách do chủ quán viết; giữ xuống dòng như khi nhập. */
@Component({
  selector: 'cus-policy-page',
  imports: [RouterLink],
  template: `
    @let state = policy();
    @if (state?.kind === 'loaded' && state.value; as value) {
      <article>
        <span class="kicker">Chính sách</span>
        <h1 tabindex="-1">{{ value.title }}</h1>
        @if (value.updatedAt) {
          <p class="meta">Cập nhật ngày {{ date(value.updatedAt) }}</p>
        }
        <div class="body">{{ value.body }}</div>
      </article>
    } @else {
      <article>
        <h1 tabindex="-1">Chưa có nội dung</h1>
        <p class="meta">Chính sách này chưa được quán công bố.</p>
        <a class="btn btn--primary" routerLink="/">Về trang chủ</a>
      </article>
    }
  `,
  styles: `
    article {
      display: grid;
      gap: var(--space-sm);
      max-width: 46rem;
      margin-inline: auto;
      padding: var(--space-lg) var(--space-md);
      border-radius: var(--radius-panel);
      background: var(--color-paper-2);
    }
    h1 {
      font-size: clamp(1.75rem, 1.3rem + 2vw, 2.5rem);
      font-weight: var(--weight-heavy);
    }
    .meta {
      color: var(--color-muted);
      font-size: var(--text-sm);
    }
    .body {
      white-space: pre-line;
      color: var(--color-ink-2);
      line-height: 1.7;
      overflow-wrap: anywhere;
    }
    .btn {
      justify-self: start;
    }
  `,
})
export class PolicyPage {
  readonly policy = input.required<Loaded<PolicyDto> | null>();
  private readonly meta = inject(PageMeta);
  protected readonly date = viDateTime;

  constructor() {
    effect(() => {
      const state = this.policy();
      const title = state?.kind === 'loaded' ? state.value.title : 'Chính sách';
      this.meta.set({ title, description: `${title} của Bếp Thầy Mão.`, path: '/chinh-sach' });
    });
  }
}
