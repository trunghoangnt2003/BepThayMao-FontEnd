import { Component } from '@angular/core';
import { createSettingsFields } from './manager-settings-form';

@Component({
  selector: 'adm-manager-settings-page',
  template: '',
})
export class ManagerSettingsPage {
  readonly form = createSettingsFields();

  submit(): void {
    // Implemented in the GREEN step.
  }
}
