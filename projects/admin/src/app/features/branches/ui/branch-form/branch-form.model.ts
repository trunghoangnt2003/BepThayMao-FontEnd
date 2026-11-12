import { FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { BranchOwnerSettingsRequest, BranchResponse } from '@bepthaymao/api-client';
import {
  latitudeValidator,
  longitudeValidator,
  managerIdentifierValidator,
  managerPasswordValidator,
  parseCoordinate,
  requiredField,
  thresholdValidator,
  timeOrderValidator,
  vnPhoneValidator,
  zaloIdsValidator,
} from './branch-form.validators';

export const DEFAULT_OPEN_TIME = '06:00';
export const DEFAULT_CLOSE_TIME = '21:30';
export const DEFAULT_THRESHOLD = '10';

export const BRANCH_FIELD_IDS = {
  name: 'branch-name',
  address: 'branch-address',
  phone: 'branch-phone',
  lat: 'branch-lat',
  lng: 'branch-lng',
  openTime: 'branch-open',
  closeTime: 'branch-close',
  threshold: 'branch-threshold',
  zaloIds: 'branch-zalo',
  bankCode: 'branch-bank-code',
  bankAccountNo: 'branch-bank-account',
  sepayAccountRef: 'branch-sepay',
} as const;

export type BranchFieldKey = keyof typeof BRANCH_FIELD_IDS;

export interface FieldError {
  readonly id: string;
  readonly message: string;
}

function field(value = '', validators: ValidatorFn[] = []): FormControl<string> {
  return new FormControl(value, { nonNullable: true, validators });
}

export function createBranchFields() {
  return new FormGroup(
    {
      name: field('', [requiredField('tên cơ sở')]),
      address: field('', [requiredField('địa chỉ')]),
      phone: field('', [requiredField('số điện thoại'), vnPhoneValidator]),
      lat: field('', [requiredField('vĩ độ'), latitudeValidator]),
      lng: field('', [requiredField('kinh độ'), longitudeValidator]),
      openTime: field(DEFAULT_OPEN_TIME, [requiredField('giờ mở nhận đơn')]),
      closeTime: field(DEFAULT_CLOSE_TIME, [requiredField('giờ đóng nhận đơn')]),
      threshold: field(DEFAULT_THRESHOLD, [thresholdValidator]),
      zaloIds: field('', [zaloIdsValidator]),
      bankCode: field(),
      bankAccountNo: field(),
      sepayAccountRef: field(),
    },
    { validators: [timeOrderValidator] },
  );
}

export type BranchFieldsGroup = ReturnType<typeof createBranchFields>;
export type BranchFieldsValue = ReturnType<BranchFieldsGroup['getRawValue']>;

export const MANAGER_FIELD_IDS = {
  identifier: 'manager-identifier',
  password: 'manager-password',
} as const;

export function createManagerFields() {
  return new FormGroup({
    identifier: field('', [requiredField('tên đăng nhập của quản lý'), managerIdentifierValidator]),
    password: field('', [requiredField('mật khẩu'), managerPasswordValidator]),
  });
}

export type ManagerFieldsGroup = ReturnType<typeof createManagerFields>;

export function firstMessage(errors: ValidationErrors | null): string | undefined {
  const values: unknown[] = errors ? Object.values(errors) : [];
  return values.find((value): value is string => typeof value === 'string');
}

/** Messages of the touched, invalid branch fields in on-screen order. */
export function branchMessages(group: BranchFieldsGroup): Partial<Record<BranchFieldKey, string>> {
  const result: Partial<Record<BranchFieldKey, string>> = {};
  for (const key of Object.keys(BRANCH_FIELD_IDS) as BranchFieldKey[]) {
    const control = group.controls[key];
    const message = control.touched ? firstMessage(control.errors) : undefined;
    if (message !== undefined) result[key] = message;
  }
  const timesTouched = group.controls.openTime.touched || group.controls.closeTime.touched;
  const order = timesTouched ? firstMessage(group.errors) : undefined;
  if (order !== undefined && result.closeTime === undefined) result.closeTime = order;
  return result;
}

export function branchFieldErrors(group: BranchFieldsGroup): FieldError[] {
  const messages = branchMessages(group);
  return (Object.keys(BRANCH_FIELD_IDS) as BranchFieldKey[]).flatMap((key) => {
    const message = messages[key];
    return message === undefined ? [] : [{ id: BRANCH_FIELD_IDS[key], message }];
  });
}

export function managerFieldErrors(group: ManagerFieldsGroup): FieldError[] {
  return (Object.keys(MANAGER_FIELD_IDS) as (keyof typeof MANAGER_FIELD_IDS)[]).flatMap((key) => {
    const control = group.controls[key];
    const message = control.touched ? firstMessage(control.errors) : undefined;
    return message === undefined ? [] : [{ id: MANAGER_FIELD_IDS[key], message }];
  });
}

const API_FIELD: Readonly<Partial<Record<string, BranchFieldKey>>> = {
  name: 'name',
  address: 'address',
  phone: 'phone',
  lat: 'lat',
  lng: 'lng',
  opentime: 'openTime',
  closetime: 'closeTime',
  abandonedthresholdminutes: 'threshold',
  zalorecipientids: 'zaloIds',
  bankcode: 'bankCode',
  bankaccountno: 'bankAccountNo',
  sepayaccountref: 'sepayAccountRef',
};

/** Puts server validation messages (`branch.<field>`) on the matching controls; returns how many landed. */
export function applyBranchServerErrors(
  group: BranchFieldsGroup,
  errors: Readonly<Record<string, readonly string[]>>,
): number {
  let applied = 0;
  for (const [path, messages] of Object.entries(errors)) {
    const key = API_FIELD[path.replace(/^branch\./i, '').toLowerCase()];
    const message = messages.at(0);
    if (!path.toLowerCase().startsWith('branch.') || key === undefined || message === undefined)
      continue;
    group.controls[key].setErrors({ server: message });
    group.controls[key].markAsTouched();
    applied++;
  }
  return applied;
}

export function applyManagerServerErrors(
  group: ManagerFieldsGroup,
  errors: Readonly<Record<string, readonly string[]>>,
): number {
  let applied = 0;
  for (const [path, messages] of Object.entries(errors)) {
    const name = path.toLowerCase().replace(/^manager\./, '');
    const message = messages.at(0);
    if (!path.toLowerCase().startsWith('manager.') || message === undefined) continue;
    const control =
      name === 'identifier'
        ? group.controls.identifier
        : name === 'password'
          ? group.controls.password
          : null;
    if (control === null) continue;
    control.setErrors({ server: message });
    control.markAsTouched();
    applied++;
  }
  return applied;
}

export function zaloIdLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function optional(text: string): string | null {
  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function toBranchSettings(fields: BranchFieldsValue): BranchOwnerSettingsRequest {
  return {
    name: fields.name.trim(),
    address: fields.address.trim(),
    phone: fields.phone.replace(/[\s.]/g, ''),
    lat: parseCoordinate(fields.lat),
    lng: parseCoordinate(fields.lng),
    openTime: fields.openTime,
    closeTime: fields.closeTime,
    abandonedThresholdMinutes: Number(fields.threshold),
    zaloRecipientIds: zaloIdLines(fields.zaloIds),
    isActive: true,
    bankCode: optional(fields.bankCode),
    bankAccountNo: optional(fields.bankAccountNo),
    sepayAccountRef: optional(fields.sepayAccountRef),
  };
}

/** Form values of a saved branch; times keep `HH:mm` even if the server sends seconds. */
export function branchToFormValue(branch: BranchResponse): BranchFieldsValue {
  return {
    name: branch.name,
    address: branch.address,
    phone: branch.phone,
    lat: String(branch.lat),
    lng: String(branch.lng),
    openTime: branch.openTime.slice(0, 5),
    closeTime: branch.closeTime.slice(0, 5),
    threshold: String(branch.abandonedThresholdMinutes),
    zaloIds: branch.zaloRecipientIds.join('\n'),
    bankCode: branch.bankCode ?? '',
    bankAccountNo: branch.bankAccountNo ?? '',
    sepayAccountRef: branch.sepayAccountRef ?? '',
  };
}

/** The saved branch as a PUT body with a new `isActive`; used by on/off so unsaved edits are never sent. */
export function toOwnerSettings(
  branch: BranchResponse,
  isActive: boolean,
): BranchOwnerSettingsRequest {
  return { ...toBranchSettings(branchToFormValue(branch)), isActive };
}

/** Like `applyBranchServerErrors`, for the flat keys of a PUT (`openTime`, `lat`...) without a `branch.` prefix. */
export function applyFlatBranchServerErrors(
  group: BranchFieldsGroup,
  errors: Readonly<Record<string, readonly string[]>>,
): number {
  let applied = 0;
  for (const [path, messages] of Object.entries(errors)) {
    const key = API_FIELD[path.toLowerCase()];
    const message = messages.at(0);
    if (key === undefined || message === undefined) continue;
    group.controls[key].setErrors({ server: message });
    group.controls[key].markAsTouched();
    applied++;
  }
  return applied;
}
