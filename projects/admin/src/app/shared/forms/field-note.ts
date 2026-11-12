import { Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon';

/** Help, warning or error line under a field; an error replaces the help instead of adding a line. */
@Component({
  selector: 'adm-field-note',
  imports: [IconComponent],
  template: `
    @if (error(); as message) {
      <p class="field__error" [id]="noteId()"><btm-icon name="warning-circle" />{{ message }}</p>
    } @else if (warning(); as message) {
      <p class="field__help" [id]="noteId()"><btm-icon name="info" />{{ message }}</p>
    } @else if (help(); as text) {
      <p class="field__help" [id]="noteId()">{{ text }}</p>
    }
  `,
  styles: `
    :host {
      display: contents;
    }
    p {
      display: flex;
      align-items: flex-start;
      gap: var(--space-xs);
    }
    btm-icon {
      flex: none;
      margin-top: 0.15em;
    }
    .field__help btm-icon {
      color: var(--color-ink);
    }
  `,
})
export class FieldNote {
  readonly noteId = input.required<string>();
  readonly error = input<string | undefined>(undefined);
  readonly warning = input<string | null | undefined>(undefined);
  readonly help = input<string | undefined>(undefined);
}
