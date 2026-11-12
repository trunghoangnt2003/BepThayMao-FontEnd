import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccessTokenStore, AdminSession } from '@bepthaymao/core';
import { roleHome } from '../../features/auth/data-access/role-home';

export const authGuard: CanActivateFn = (_route, state) =>
  inject(AccessTokenStore).session() !== null ||
  inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
export const loginGuard: CanActivateFn = () => {
  const role = inject(AccessTokenStore).session()?.role;
  return !role || role === 'Customer' || inject(Router).createUrlTree([roleHome(role)]);
};
export function roleGuard(...roles: AdminSession['role'][]): CanActivateFn {
  return () => {
    const role = inject(AccessTokenStore).session()?.role;
    return (
      (role !== undefined && roles.includes(role)) || inject(Router).createUrlTree(['/forbidden'])
    );
  };
}

export const homeGuard: CanActivateFn = () =>
  inject(Router).createUrlTree([roleHome(inject(AccessTokenStore).session()?.role)]);
