import { Component, input } from '@angular/core';
import { BranchFieldsGroup } from './branch-form.model';

@Component({
  selector: 'adm-branch-form',
  template: '',
})
export class BranchForm {
  readonly group = input.required<BranchFieldsGroup>();
}
