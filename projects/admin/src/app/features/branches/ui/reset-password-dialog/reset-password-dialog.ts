import { Component, signal } from '@angular/core';

@Component({
  selector: 'adm-reset-password-dialog',
  template: '',
})
export class ResetPasswordDialog {
  readonly issued = signal<string | null>(null);
}
