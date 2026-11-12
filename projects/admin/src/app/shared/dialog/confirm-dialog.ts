import { Component, inject, Injectable } from '@angular/core';
import {
  HLM_DIALOG_OPTIONS,
  HlmButton,
  HlmDialog,
  HlmDialogDescription,
  HlmDialogTitle,
} from '@bepthaymao/ui';
import {
  BrnDialogContext,
  BrnDialogService,
  injectBrnDialogContext,
} from '@spartan-ng/brain/dialog';
import { firstValueFrom } from 'rxjs';

export interface ConfirmOptions {
  readonly title: string;
  readonly body: string;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  /** Styles the confirm button as destructive (`.btn--danger`) instead of the one primary action. */
  readonly danger?: boolean;
}

@Component({
  selector: 'adm-confirm-dialog',
  imports: [HlmButton, HlmDialog, HlmDialogTitle, HlmDialogDescription],
  template: `
    <hlm-dialog>
      <h2 hlmDialogTitle>{{ context.title }}</h2>
      <p hlmDialogDescription>{{ context.body }}</p>
      <div class="hlm-dialog__actions">
        <button
          hlmBtn
          variant="outline"
          type="button"
          data-autofocus
          (click)="context.close(false)"
        >
          {{ context.cancelLabel }}
        </button>
        <button
          hlmBtn
          type="button"
          [variant]="context.danger ? 'danger' : 'default'"
          (click)="context.close(true)"
        >
          {{ context.confirmLabel }}
        </button>
      </div>
    </hlm-dialog>
  `,
})
export class ConfirmDialogContent {
  protected readonly context = injectBrnDialogContext<BrnDialogContext<ConfirmOptions>>();
}

/** Asks a yes/no question in a modal; Escape, the scrim and the cancel button all answer `false`. */
@Injectable({ providedIn: 'root' })
export class ConfirmDialog {
  private readonly dialogs = inject(BrnDialogService);

  confirm(options: ConfirmOptions): Promise<boolean> {
    const ref = this.dialogs.open<ConfirmOptions, boolean>(
      ConfirmDialogContent,
      undefined,
      options,
      HLM_DIALOG_OPTIONS,
    );
    return firstValueFrom(ref.closed$).then((result) => result === true);
  }
}
