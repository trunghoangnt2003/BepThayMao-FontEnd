import { Component, computed, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HlmInput, HlmLabel } from '@bepthaymao/ui';
import { FieldNote } from '../../../../shared/forms/field-note';
import { trackForm } from '../../../../shared/forms/track-form';
import {
  BRANCH_FIELD_IDS,
  BranchFieldKey,
  BranchFieldsGroup,
  branchMessages,
} from './branch-form.model';
import { outsideVietnamWarning } from './branch-form.validators';

const FIELDS_WITH_HELP: ReadonlySet<BranchFieldKey> = new Set(['threshold', 'zaloIds']);

@Component({
  selector: 'adm-branch-form',
  imports: [ReactiveFormsModule, HlmInput, HlmLabel, FieldNote],
  templateUrl: './branch-form.html',
  styleUrl: './branch-form.css',
})
export class BranchForm {
  readonly group = input.required<BranchFieldsGroup>();
  private readonly version = trackForm(() => this.group());
  protected readonly errors = computed(() => {
    this.version();
    return branchMessages(this.group());
  });
  protected readonly coordinateWarning = computed(() => {
    this.version();
    const { lat, lng } = this.group().getRawValue();
    return outsideVietnamWarning(lat, lng);
  });

  /** The note line is referenced when it shows an error, or always when the field has its own help. */
  protected describedBy(key: BranchFieldKey, ...fixed: string[]): string | null {
    const note =
      this.errors()[key] !== undefined || FIELDS_WITH_HELP.has(key)
        ? [`${BRANCH_FIELD_IDS[key]}-note`]
        : [];
    const ids = [...fixed, ...note];
    return ids.length > 0 ? ids.join(' ') : null;
  }
}
