// Adapted from @spartan-ng/cli 1.9.0 helm dialog (MIT); Chanh muối styling lives in styles/dialog.css.
import { Component, Directive } from '@angular/core';
import { BrnDialogDescription, BrnDialogOptions, BrnDialogTitle } from '@spartan-ng/brain/dialog';

/**
 * Options for `BrnDialogService.open`. Brain (on the CDK dialog) traps focus, closes on Escape and
 * the scrim, marks the page behind `aria-hidden` and restores focus to the opener. The control with
 * `data-autofocus` takes focus first: the safe choice of a confirmation, or the first field of a form.
 */
export const HLM_DIALOG_OPTIONS: Partial<BrnDialogOptions> = {
  panelClass: 'hlm-dialog-pane',
  backdropClass: 'hlm-dialog-backdrop',
  autoFocus: '[data-autofocus]',
  restoreFocus: true,
  ariaModal: true,
};

@Component({
  selector: 'hlm-dialog',
  host: { '[class]': 'classes' },
  template: '<ng-content />',
})
export class HlmDialog {
  protected readonly classes = 'hlm-dialog';
}

@Directive({
  selector: '[hlmDialogTitle]',
  hostDirectives: [BrnDialogTitle],
  host: { '[class]': 'classes' },
})
export class HlmDialogTitle {
  protected readonly classes = 'hlm-dialog__title';
}

@Directive({
  selector: '[hlmDialogDescription]',
  hostDirectives: [BrnDialogDescription],
  host: { '[class]': 'classes' },
})
export class HlmDialogDescription {
  protected readonly classes = 'hlm-dialog__description';
}
