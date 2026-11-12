// Adapted from @spartan-ng/cli 1.9.0 helm dialog (MIT); Garden styling is owned here.
import { Component, Directive } from '@angular/core';
import { BrnDialogOptions } from '@spartan-ng/brain/dialog';

export const HLM_DIALOG_OPTIONS: Partial<BrnDialogOptions> = {};

@Component({ selector: 'hlm-dialog', template: '' })
export class HlmDialog {
  protected readonly classes = '';
}

@Directive({ selector: '[hlmDialogTitle]' })
export class HlmDialogTitle {
  protected readonly classes = '';
}

@Directive({ selector: '[hlmDialogDescription]' })
export class HlmDialogDescription {
  protected readonly classes = '';
}
