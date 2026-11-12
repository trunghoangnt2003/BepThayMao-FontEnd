import { Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon';

/** Inline message. Errors are announced at once (alert); information waits its turn (status). */
@Component({
  selector: 'adm-banner',
  imports: [IconComponent],
  host: {
    '[attr.role]': "kind() === 'error' ? 'alert' : 'status'",
    '[attr.data-kind]': 'kind()',
  },
  template: `
    <btm-icon [name]="kind() === 'error' ? 'warning-circle' : 'info'" />
    <div><ng-content /></div>
  `,
  styles: `
    :host {
      display: flex;
      align-items: flex-start;
      gap: var(--space-sm);
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-card);
      background: var(--color-paper-2);
    }
    btm-icon {
      flex: none;
      margin-top: 0.1em;
    }
    :host([data-kind='error']) btm-icon {
      color: var(--color-error);
    }
    div {
      min-width: 0;
      overflow-wrap: anywhere;
    }
  `,
})
export class Banner {
  readonly kind = input<'error' | 'info'>('info');
}
