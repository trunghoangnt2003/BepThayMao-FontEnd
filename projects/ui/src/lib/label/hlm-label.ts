// Adapted from @spartan-ng/cli 1.9.0 helm label (MIT); Chanh muối styling is owned here.
import { Directive } from '@angular/core';
import { BrnLabel } from '@spartan-ng/brain/label';

@Directive({
  selector: 'label[hlmLabel]',
  hostDirectives: [{ directive: BrnLabel, inputs: ['for'] }],
  host: { '[class]': 'classes' },
})
export class HlmLabel {
  protected readonly classes = 'field__label';
}
