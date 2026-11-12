import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { ConfirmDialog } from '../../../../shared/dialog/confirm-dialog';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/** Asks before leaving an edit page that still holds unsaved changes; "Ở lại" is the safe default. */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (page) =>
  !page.hasUnsavedChanges() ||
  inject(ConfirmDialog).confirm({
    title: 'Rời trang này?',
    body: 'Bạn có thay đổi chưa lưu. Rời trang sẽ mất các thay đổi này.',
    confirmLabel: 'Rời trang',
    cancelLabel: 'Ở lại',
  });
