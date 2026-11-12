import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toApiError } from '@bepthaymao/core';
import { PageMeta } from '../../../shared/seo/page-meta';
import { OrderApi } from '../data-access/order-api';
import { CartStore } from '../data-access/shop-data';

@Component({
  selector: 'cus-lookup-page',
  imports: [ReactiveFormsModule],
  template: `
    <h1 tabindex="-1">Tra cứu đơn hàng</h1>
    <p class="lead">Nhập mã đơn và số điện thoại đã dùng khi đặt.</p>
    <form class="card" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      }
      <div class="field">
        <label class="field__label" for="l-code">Mã đơn</label>
        <input
          id="l-code"
          class="field__input"
          formControlName="code"
          autocapitalize="characters"
          autocomplete="off"
          spellcheck="false"
          aria-describedby="l-code-help"
        />
        <span class="field__help" id="l-code-help">Mã gồm BTM và 6 ký tự, ví dụ BTM7K3F2P.</span>
      </div>
      <div class="field">
        <label class="field__label" for="l-phone">Số điện thoại</label>
        <input
          id="l-phone"
          class="field__input"
          type="tel"
          inputmode="tel"
          autocomplete="tel-national"
          formControlName="phone"
        />
      </div>
      <button type="submit" class="btn btn--primary" [disabled]="busy()">
        {{ busy() ? 'Đang tra cứu…' : 'Tra cứu đơn' }}
      </button>
    </form>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--space-sm);
      max-width: var(--measure-form);
      width: 100%;
      margin-inline: auto;
    }
    .lead {
      color: var(--color-ink-2);
    }
    .card {
      display: grid;
      gap: var(--space-md);
      padding: var(--space-md);
      border-radius: var(--radius-panel);
      background: var(--color-paper-2);
      box-shadow: var(--shadow-card);
    }
    .error {
      padding: var(--space-sm) var(--space-md);
      border: 2px solid var(--color-error);
      border-radius: var(--radius-card);
    }
  `,
})
export class LookupPage {
  private readonly api = inject(OrderApi);
  private readonly router = inject(Router);
  private readonly cart = inject(CartStore);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = inject(NonNullableFormBuilder).group({ code: [''], phone: [''] });

  constructor() {
    inject(PageMeta).set({
      title: 'Tra cứu đơn hàng',
      description: 'Tra cứu đơn bằng mã đơn và số điện thoại.',
      path: '/tra-don',
      robots: 'noindex',
    });
  }

  protected submit(): void {
    const code = this.form.getRawValue().code.trim().toUpperCase();
    const phone = this.form.getRawValue().phone.replace(/[\s.-]/g, '');
    if (!code || !phone) {
      this.error.set('Nhập mã đơn và số điện thoại.');
      document.getElementById(code ? 'l-phone' : 'l-code')?.focus();
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    this.api.track(code, phone).subscribe({
      next: () => {
        this.cart.rememberOrder(code, phone);
        void this.router.navigate(['/don', code]);
      },
      error: (error: unknown) => {
        this.busy.set(false);
        this.error.set(
          toApiError(error).status === 429
            ? 'Bạn thử quá nhiều lần. Đợi vài phút rồi thử lại.'
            : 'Không tìm thấy đơn khớp với mã đơn và số điện thoại này. Kiểm tra lại cả hai rồi thử lại.',
        );
        document.getElementById('l-code')?.focus();
      },
    });
  }
}
