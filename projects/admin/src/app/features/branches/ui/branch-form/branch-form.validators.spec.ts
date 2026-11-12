import { AbstractControl, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import {
  latitudeValidator,
  longitudeValidator,
  managerIdentifierValidator,
  managerPasswordValidator,
  outsideVietnamWarning,
  requiredField,
  thresholdValidator,
  timeOrderValidator,
  vnPhoneValidator,
  zaloIdsValidator,
} from './branch-form.validators';

function message(validator: ValidatorFn, value: string, control?: AbstractControl): string | null {
  const errors = validator(control ?? new FormControl(value));
  const first: unknown = errors ? Object.values(errors)[0] : null;
  return typeof first === 'string' ? first : null;
}

const IDENTIFIER_MESSAGE =
  'Tên đăng nhập chỉ gồm chữ không dấu, số và các ký tự . _ - @ +, dài 3 đến 64 ký tự.';

it.each([
  ['06:00', '06:00'],
  ['06:00', '05:59'],
])('rejects close time %s <= open time %s', (open, close) => {
  const group = new FormGroup({
    openTime: new FormControl(open),
    closeTime: new FormControl(close),
  });
  expect(message(timeOrderValidator, '', group)).toBe(
    'Giờ đóng phải sau giờ mở trong cùng một ngày.',
  );
});

it('accepts a close time after the open time', () => {
  const group = new FormGroup({
    openTime: new FormControl('06:00'),
    closeTime: new FormControl('21:30'),
  });
  expect(timeOrderValidator(group)).toBeNull();
});

it.each([
  [latitudeValidator, '91', 'Vĩ độ nằm trong khoảng từ -90 đến 90.'],
  [latitudeValidator, 'abc', 'Vĩ độ nằm trong khoảng từ -90 đến 90.'],
  [longitudeValidator, '-181', 'Kinh độ nằm trong khoảng từ -180 đến 180.'],
  [thresholdValidator, '0', 'Nhập số phút là số nguyên, tối thiểu 1.'],
  [thresholdValidator, '1.5', 'Nhập số phút là số nguyên, tối thiểu 1.'],
  [thresholdValidator, '', 'Nhập số phút là số nguyên, tối thiểu 1.'],
  [vnPhoneValidator, '12345', 'Nhập số điện thoại hợp lệ, ví dụ 0901 234 567.'],
  [managerPasswordValidator, '123456789', 'Mật khẩu cần ít nhất 10 ký tự.'],
  [zaloIdsValidator, '111\n222\n111', 'ID Zalo bị trùng: 111.'],
  [managerIdentifierValidator, 'quản-lý', IDENTIFIER_MESSAGE],
  [managerIdentifierValidator, 'ql 1', IDENTIFIER_MESSAGE],
  [managerIdentifierValidator, 'ab', IDENTIFIER_MESSAGE],
  [managerIdentifierValidator, 'a'.repeat(65), IDENTIFIER_MESSAGE],
])('%o rejects %j with the contract message', (validator, value, expected) => {
  expect(message(validator, value)).toBe(expected);
});

it.each([
  [latitudeValidator, '-90'],
  [latitudeValidator, '10,7769'],
  [longitudeValidator, '106.7009'],
  [thresholdValidator, '10'],
  [vnPhoneValidator, '0901 234 567'],
  [vnPhoneValidator, '+84901234567'],
  [vnPhoneValidator, '0901.234.567'],
  [managerPasswordValidator, '1234567890'],
  [zaloIdsValidator, ' 111 \n\n222\n'],
  [zaloIdsValidator, ''],
  [managerIdentifierValidator, 'quanly-1'],
  [managerIdentifierValidator, 'ql.co_so@1+a'],
])('%o accepts %j', (validator, value) => {
  expect(validator(new FormControl(value))).toBeNull();
});

it.each([
  ['', 'Tên cơ sở', 'Nhập tên cơ sở.'],
  ['   ', 'Địa chỉ', 'Nhập địa chỉ.'],
])('requires %j for %s', (value, label, expected) => {
  expect(message(requiredField(label.toLowerCase()), value)).toBe(expected);
  expect(requiredField(label.toLowerCase())(new FormControl('có'))).toBeNull();
});

it('warns without blocking when valid coordinates fall outside Vietnam', () => {
  const warning =
    'Tọa độ này nằm ngoài Việt Nam. Kiểm tra xem vĩ độ và kinh độ có bị nhầm chỗ không.';
  expect(outsideVietnamWarning('50', '106')).toBe(warning);
  expect(outsideVietnamWarning('10.7769', '106.7009')).toBeNull();
  expect(outsideVietnamWarning('10', '200')).toBeNull();
  expect(outsideVietnamWarning('', '106')).toBeNull();
});
