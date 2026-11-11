// Adapted from @spartan-ng/cli 1.9.0 helm input (MIT); Garden styling is owned here.
import { Directive } from '@angular/core';
import { BrnInput } from '@spartan-ng/brain/input';

@Directive({
  selector: 'input[hlmInput], textarea[hlmInput]',
  hostDirectives: [{ directive: BrnInput, inputs: ['id', 'forceInvalid'] }],
  host: { '[class]': 'classes' },
})
export class HlmInput {
  protected readonly classes = 'field__input';
}
