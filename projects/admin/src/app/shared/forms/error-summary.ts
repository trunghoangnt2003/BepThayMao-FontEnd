import { Component, ElementRef, input, viewChild } from '@angular/core';

export interface SummaryItem {
  readonly id: string;
  readonly message: string;
}

/** Form-level list of problems; its heading is the focus target after a failed submit. */
@Component({
  selector: 'adm-error-summary',
  template: `
    <section class="summary" aria-labelledby="error-summary-title">
      <h2 id="error-summary-title" #heading tabindex="-1">Có {{ errors().length }} chỗ cần sửa</h2>
      <ul>
        @for (item of errors(); track item.id) {
          <li>
            <a [attr.href]="'#' + item.id" (click)="goTo($event, item.id)">{{ item.message }}</a>
          </li>
        }
      </ul>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
    .summary {
      display: grid;
      gap: var(--space-sm);
      padding: var(--space-md);
      border: var(--rule-hair) solid var(--color-error);
      border-radius: var(--radius-card);
      background: var(--color-paper);
    }
    ul {
      display: grid;
      gap: var(--space-2xs);
      margin: 0;
      padding-inline-start: var(--space-lg);
    }
    a {
      display: inline-flex;
      align-items: center;
      min-height: var(--control-h);
      color: var(--color-ink);
    }
  `,
})
export class ErrorSummary {
  readonly errors = input.required<readonly SummaryItem[]>();
  private readonly heading = viewChild.required<ElementRef<HTMLElement>>('heading');

  focus(): void {
    this.heading().nativeElement.focus();
  }

  protected goTo(event: Event, id: string): void {
    event.preventDefault();
    document.getElementById(id)?.focus();
  }
}
