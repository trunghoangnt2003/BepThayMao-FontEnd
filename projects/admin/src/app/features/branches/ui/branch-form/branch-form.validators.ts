import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Every validator reports `{ code: 'Thông điệp tiếng Việt' }` so the UI can show the first message as is. */
export const MESSAGES = {
  timeOrder: 'Giờ đóng phải sau giờ mở trong cùng một ngày.',
  latitude: 'Vĩ độ nằm trong khoảng từ -90 đến 90.',
  longitude: 'Kinh độ nằm trong khoảng từ -180 đến 180.',
  threshold: 'Nhập số phút là số nguyên, tối thiểu 1.',
  phone: 'Nhập số điện thoại hợp lệ, ví dụ 0901 234 567.',
  password: 'Mật khẩu cần ít nhất 10 ký tự.',
  identifier: 'Tên đăng nhập chỉ gồm chữ không dấu, số và các ký tự . _ - @ +, dài 3 đến 64 ký tự.',
  outsideVietnam:
    'Tọa độ này nằm ngoài Việt Nam. Kiểm tra xem vĩ độ và kinh độ có bị nhầm chỗ không.',
} as const;

const PHONE_PATTERN = /^(\+84|0)[0-9]{8,10}$/;
const IDENTIFIER_PATTERN = /^[A-Za-z0-9._@+-]{3,64}$/;
const INTEGER_PATTERN = /^[0-9]+$/;

function text(control: AbstractControl): string {
  const value: unknown = control.value;
  return typeof value === 'string' ? value : '';
}

export function parseCoordinate(value: string): number {
  const trimmed = value.trim().replace(',', '.');
  return trimmed === '' ? Number.NaN : Number(trimmed);
}

export function requiredField(label: string): ValidatorFn {
  return (control) => (text(control).trim() === '' ? { required: `Nhập ${label}.` } : null);
}

function inRange(code: 'latitude' | 'longitude', limit: number): ValidatorFn {
  return (control): ValidationErrors | null => {
    if (text(control).trim() === '') return null;
    const value = parseCoordinate(text(control));
    return Number.isFinite(value) && Math.abs(value) <= limit ? null : { [code]: MESSAGES[code] };
  };
}

export const latitudeValidator: ValidatorFn = inRange('latitude', 90);
export const longitudeValidator: ValidatorFn = inRange('longitude', 180);

export const timeOrderValidator: ValidatorFn = (group) => {
  const open = text(group.get('openTime') ?? group);
  const close = text(group.get('closeTime') ?? group);
  return open !== '' && close !== '' && close <= open ? { timeOrder: MESSAGES.timeOrder } : null;
};

export const thresholdValidator: ValidatorFn = (control) => {
  const value = text(control).trim();
  return INTEGER_PATTERN.test(value) && Number(value) >= 1
    ? null
    : { threshold: MESSAGES.threshold };
};

export const vnPhoneValidator: ValidatorFn = (control) => {
  const value = text(control).replace(/[\s.]/g, '');
  return value === '' || PHONE_PATTERN.test(value) ? null : { phone: MESSAGES.phone };
};

export const zaloIdsValidator: ValidatorFn = (control) => {
  const seen = new Set<string>();
  for (const line of text(control).split(/\r?\n/)) {
    const id = line.trim();
    if (id === '') continue;
    if (seen.has(id)) return { zaloDuplicate: `ID Zalo bị trùng: ${id}.` };
    seen.add(id);
  }
  return null;
};

export const managerIdentifierValidator: ValidatorFn = (control) => {
  const value = text(control);
  return value === '' || IDENTIFIER_PATTERN.test(value)
    ? null
    : { identifier: MESSAGES.identifier };
};

export const managerPasswordValidator: ValidatorFn = (control) => {
  const value = text(control);
  return value === '' || value.length >= 10 ? null : { password: MESSAGES.password };
};

export function outsideVietnamWarning(lat: string, lng: string): string | null {
  const latitude = parseCoordinate(lat);
  const longitude = parseCoordinate(lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  const inside = latitude >= 8 && latitude <= 24 && longitude >= 102 && longitude <= 110;
  return inside ? null : MESSAGES.outsideVietnam;
}
