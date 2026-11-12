import { Component } from '@angular/core';
import { createBranchFields } from '../../ui/branch-form/branch-form.model';

@Component({
  selector: 'adm-branch-edit-page',
  template: '',
})
export class BranchEditPage {
  readonly form = createBranchFields();

  hasUnsavedChanges(): boolean {
    return false;
  }

  submit(): void {
    // Implemented in the GREEN step.
  }

  toggleActive(): Promise<void> {
    return Promise.resolve();
  }
}
