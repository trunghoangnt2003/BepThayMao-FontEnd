import { CanActivateFn } from '@angular/router';
import { AdminSession } from '@bepthaymao/core';

export const authGuard: CanActivateFn = () => false;
export const loginGuard: CanActivateFn = () => false;
export function roleGuard(...roles: AdminSession['role'][]): CanActivateFn {
  return () => roles.length === 0;
}
