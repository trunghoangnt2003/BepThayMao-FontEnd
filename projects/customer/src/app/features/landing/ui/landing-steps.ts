import { Component } from '@angular/core';

/** Ba bước đặt xôi, đúng luồng đã chốt: chọn món, chọn cơ sở, quét QR. */
@Component({
  selector: 'cus-landing-steps',
  template: `
    <ol>
      @for (step of steps; track step.title) {
        <li>
          <b>{{ step.title }}</b>
          <span>{{ step.text }}</span>
        </li>
      }
    </ol>
  `,
  styles: `
    ol {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr));
      gap: var(--space-md);
      margin: 0;
      padding: 0;
      list-style: none;
      counter-reset: step;
    }
    li {
      display: grid;
      gap: var(--space-xs);
      padding: var(--space-lg);
      border-radius: var(--radius-panel);
      background: var(--color-paper-3);
      counter-increment: step;
    }
    li::before {
      content: counter(step);
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      margin-bottom: var(--space-xs);
      border-radius: 50%;
      background: var(--cocoa);
      color: var(--gold);
      font-weight: var(--weight-heavy);
    }
    b {
      font-size: 1.25rem;
    }
    span {
      color: var(--color-ink-2);
    }
  `,
})
export class LandingSteps {
  protected readonly steps = [
    { title: 'Chọn món', text: 'Thêm món vào giỏ từ thực đơn chung.' },
    { title: 'Chọn cơ sở', text: 'Ở bước đặt hàng, bạn chọn cơ sở gần nhất đang nhận đơn.' },
    {
      title: 'Quét mã QR',
      text: 'Thanh toán tiền món bằng QR. Phí ship trả riêng khi nhận hàng.',
    },
  ] as const;
}
