import { Component, signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { createBranchFields } from '../../ui/branch-form/branch-form.model';

export interface CreatedBranch {
  readonly id: string;
  readonly name: string;
  readonly identifier: string;
  readonly password: string;
}

@Component({
  selector: 'adm-branch-create-page',
  template: '',
})
export class BranchCreatePage {
  readonly form = new FormGroup({
    branch: createBranchFields(),
    manager: new FormGroup({
      identifier: new FormControl('', { nonNullable: true }),
      password: new FormControl('', { nonNullable: true }),
    }),
  });
  readonly created = signal<CreatedBranch | null>(null);
  readonly visiblePassword = signal(false);
  readonly copied = signal(false);

  submit(): void {
    // Behaviour arrives in the GREEN commit.
  }

  generatePassword(): void {
    // Behaviour arrives in the GREEN commit.
  }

  copyPassword(): void {
    // Behaviour arrives in the GREEN commit.
  }
}
