import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BranchOwnerSettingsRequest } from '@bepthaymao/api-client';

export const DEFAULT_OPEN_TIME = '06:00';
export const DEFAULT_CLOSE_TIME = '21:30';
export const DEFAULT_THRESHOLD = '10';

function field(value = '', required = true): FormControl<string> {
  return new FormControl(value, {
    nonNullable: true,
    validators: required ? [(control) => Validators.required(control)] : [],
  });
}

export function createBranchFields() {
  return new FormGroup({
    name: field(),
    address: field(),
    phone: field(),
    lat: field(),
    lng: field(),
    openTime: field(DEFAULT_OPEN_TIME),
    closeTime: field(DEFAULT_CLOSE_TIME),
    threshold: field(DEFAULT_THRESHOLD),
    zaloIds: field('', false),
    bankCode: field('', false),
    bankAccountNo: field('', false),
    sepayAccountRef: field('', false),
  });
}

export type BranchFieldsGroup = ReturnType<typeof createBranchFields>;
export type BranchFieldsValue = ReturnType<BranchFieldsGroup['getRawValue']>;

export function parseDecimal(text: string): number {
  return Number(text.trim().replace(',', '.'));
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
    lat: parseDecimal(fields.lat),
    lng: parseDecimal(fields.lng),
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
