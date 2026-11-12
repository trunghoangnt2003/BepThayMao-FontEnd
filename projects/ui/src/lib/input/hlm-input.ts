// Adapted from @spartan-ng/cli 1.9.0 helm input (MIT); Chanh muối styling is owned here.
import { afterRenderEffect, Directive, ElementRef, inject } from '@angular/core';
import { BrnFieldControl } from '@spartan-ng/brain/field';
import { BrnInput } from '@spartan-ng/brain/input';

@Directive({
  selector: 'input[hlmInput], textarea[hlmInput]',
  hostDirectives: [{ directive: BrnInput, inputs: ['id', 'forceInvalid'] }],
  host: { '[class]': 'classes' },
})
export class HlmInput {
  protected readonly classes = 'field__input';
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly control = inject(BrnFieldControl, { self: true, optional: true });

  constructor() {
    // Brain's own host binding reports `invalid` from the first keystroke and is applied after ours,
    // so the attribute is settled after render: announce an invalid entry only once the field was visited.
    afterRenderEffect(() => {
      const element = this.element.nativeElement;
      if (this.control?.spartanInvalid()) element.setAttribute('aria-invalid', 'true');
      else element.removeAttribute('aria-invalid');
    });
  }
}
