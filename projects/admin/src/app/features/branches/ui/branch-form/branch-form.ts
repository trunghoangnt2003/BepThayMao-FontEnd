import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HlmInput, HlmLabel } from '@bepthaymao/ui';
import { BranchFieldsGroup } from './branch-form.model';

@Component({
  selector: 'adm-branch-form',
  imports: [ReactiveFormsModule, HlmInput, HlmLabel],
  templateUrl: './branch-form.html',
  styleUrl: './branch-form.css',
})
export class BranchForm {
  readonly group = input.required<BranchFieldsGroup>();
}
