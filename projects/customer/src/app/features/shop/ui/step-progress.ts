import { Component, input, output } from '@angular/core';

/** Thanh tiến độ đặt hàng: bước đã qua bấm được để quay lại, bước chưa tới bị khóa. */
@Component({
  selector: 'cus-step-progress',
  template: `
    <ol aria-label="Các bước đặt hàng">
      @for (label of labels(); track label; let index = $index) {
        <li [attr.data-s]="index < current() ? 'done' : index === current() ? 'now' : 'todo'">
          <button
            type="button"
            [disabled]="index > reached()"
            [attr.aria-current]="index === current() ? 'step' : null"
            (click)="pick.emit(index)"
          >
            <span class="dot num">{{ index + 1 }}</span
            ><span>{{ label }}</span>
          </button>
        </li>
      }
    </ol>
  `,
  styles: `
    ol {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 6px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    button {
      display: grid;
      justify-items: center;
      gap: 6px;
      width: 100%;
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--color-muted);
      font: inherit;
      font-size: 0.75rem;
      font-weight: var(--weight-strong);
    }
    button::before {
      content: '';
      width: 100%;
      height: 5px;
      border-radius: var(--radius-pill);
      background: var(--color-paper-3);
    }
    .dot {
      display: grid;
      place-items: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--color-paper-3);
      transition: transform 300ms var(--spring);
    }
    [data-s='done'] button {
      color: var(--color-ink-2);
      cursor: pointer;
    }
    [data-s='done'] button::before,
    [data-s='done'] .dot {
      background: var(--la);
      color: var(--color-paper-2);
    }
    [data-s='now'] button {
      color: var(--color-ink);
    }
    [data-s='now'] button::before {
      background: var(--gold);
    }
    [data-s='now'] .dot {
      background: var(--cocoa);
      color: var(--gold);
      transform: scale(1.12);
    }
  `,
})
export class StepProgress {
  readonly labels = input.required<readonly string[]>();
  readonly current = input.required<number>();
  readonly reached = input.required<number>();
  readonly pick = output<number>();
}
