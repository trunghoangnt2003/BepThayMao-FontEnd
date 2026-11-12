// Adapted from @spartan-ng/cli 1.9.0 helm button (MIT); Garden styling is owned here.
import { Directive, input } from '@angular/core';
import { BrnButton } from '@spartan-ng/brain/button';

@Directive({
  selector: 'button[hlmBtn], a[hlmBtn]',
  exportAs: 'hlmBtn',
  hostDirectives: [{ directive: BrnButton, inputs: ['disabled'] }],
  host: {
    class: 'btn',
    '[class.btn--primary]': "variant() === 'default'",
    '[class.btn--danger]': "variant() === 'danger'",
  },
})
export class HlmButton {
  readonly variant = input<'default' | 'outline' | 'danger'>('default');
}
