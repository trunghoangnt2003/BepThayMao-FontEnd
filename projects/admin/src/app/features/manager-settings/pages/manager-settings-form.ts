import { FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { BranchSettingsRequest, ManagerBranchView } from '@bepthaymao/api-client';
import {
  FieldError,
  firstMessage,
  zaloIdLines,
} from '../../branches/ui/branch-form/branch-form.model';
import {
  requiredField,
  thresholdValidator,
  timeOrderValidator,
  vnPhoneValidator,
  zaloIdsValidator,
} from '../../branches/ui/branch-form/branch-form.validators';

export const SETTINGS_FIELD_IDS = {
  phone: 'settings-phone',
  openTime: 'settings-open',
  closeTime: 'settings-close',
  threshold: 'settings-threshold',
  zaloIds: 'settings-zalo',
} as const;

export type SettingsFieldKey = keyof typeof SETTINGS_FIELD_IDS;

function field(value = '', validators: ValidatorFn[] = []): FormControl<string> {
  return new FormControl(value, { nonNullable: true, validators });
}

export function createSettingsFields() {
  return new FormGroup(
    {
      phone: field('', [requiredField('số điện thoại'), vnPhoneValidator]),
      openTime: field('', [requiredField('giờ mở nhận đơn')]),
      closeTime: field('', [requiredField('giờ đóng nhận đơn')]),
      threshold: field('', [thresholdValidator]),
      zaloIds: field('', [zaloIdsValidator]),
    },
    { validators: [timeOrderValidator] },
  );
}

export type SettingsFieldsGroup = ReturnType<typeof createSettingsFields>;

export function settingsToFormValue(
  view: ManagerBranchView,
): ReturnType<SettingsFieldsGroup['getRawValue']> {
  return {
    phone: view.phone,
    openTime: view.openTime.slice(0, 5),
    closeTime: view.closeTime.slice(0, 5),
    threshold: String(view.abandonedThresholdMinutes),
    zaloIds: view.zaloRecipientIds.join('\n'),
  };
}

export function toSettingsRequest(group: SettingsFieldsGroup): BranchSettingsRequest {
  const value = group.getRawValue();
  return {
    phone: value.phone.replace(/[\s.]/g, ''),
    openTime: value.openTime,
    closeTime: value.closeTime,
    abandonedThresholdMinutes: Number(value.threshold),
    zaloRecipientIds: zaloIdLines(value.zaloIds),
  };
}

/** Messages of the touched, invalid fields in on-screen order. */
export function settingsMessages(
  group: SettingsFieldsGroup,
): Partial<Record<SettingsFieldKey, string>> {
  const result: Partial<Record<SettingsFieldKey, string>> = {};
  for (const key of Object.keys(SETTINGS_FIELD_IDS) as SettingsFieldKey[]) {
    const control = group.controls[key];
    const message = control.touched ? firstMessage(control.errors) : undefined;
    if (message !== undefined) result[key] = message;
  }
  const timesTouched = group.controls.openTime.touched || group.controls.closeTime.touched;
  const order = timesTouched ? firstMessage(group.errors) : undefined;
  if (order !== undefined && result.closeTime === undefined) result.closeTime = order;
  return result;
}

export function settingsFieldErrors(group: SettingsFieldsGroup): FieldError[] {
  const messages = settingsMessages(group);
  return (Object.keys(SETTINGS_FIELD_IDS) as SettingsFieldKey[]).flatMap((key) => {
    const message = messages[key];
    return message === undefined ? [] : [{ id: SETTINGS_FIELD_IDS[key], message }];
  });
}

const SERVER_FIELD: Readonly<Partial<Record<string, SettingsFieldKey>>> = {
  phone: 'phone',
  opentime: 'openTime',
  closetime: 'closeTime',
  abandonedthresholdminutes: 'threshold',
  zalorecipientids: 'zaloIds',
};

/** Puts the server's flat camelCase validation messages on the matching controls; returns how many landed. */
export function applySettingsServerErrors(
  group: SettingsFieldsGroup,
  errors: Readonly<Record<string, readonly string[]>>,
): number {
  let applied = 0;
  for (const [path, messages] of Object.entries(errors)) {
    const key = SERVER_FIELD[path.toLowerCase()];
    const message = messages.at(0);
    if (key === undefined || message === undefined) continue;
    group.controls[key].setErrors({ server: message });
    group.controls[key].markAsTouched();
    applied++;
  }
  return applied;
}
