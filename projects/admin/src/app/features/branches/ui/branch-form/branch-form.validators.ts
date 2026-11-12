import { ValidatorFn } from '@angular/forms';

const pending: ValidatorFn = () => null;

export function requiredField(label: string): ValidatorFn {
  return (control) => (control.value === label ? { required: label } : null);
}

export const timeOrderValidator: ValidatorFn = pending;
export const latitudeValidator: ValidatorFn = pending;
export const longitudeValidator: ValidatorFn = pending;
export const thresholdValidator: ValidatorFn = pending;
export const zaloIdsValidator: ValidatorFn = pending;
export const vnPhoneValidator: ValidatorFn = pending;
export const managerIdentifierValidator: ValidatorFn = pending;
export const managerPasswordValidator: ValidatorFn = pending;

export function outsideVietnamWarning(lat: string, lng: string): string | null {
  return lat.length + lng.length < 0 ? 'pending' : null;
}
