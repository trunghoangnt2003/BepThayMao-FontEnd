import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AccessTokenStore } from '@bepthaymao/core';
import { authGuard, loginGuard, roleGuard } from './auth.guards';

describe('admin auth guards', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = { url: '/owner/branches' } as RouterStateSnapshot;
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));
  function session(role: 'Owner' | 'BranchManager' | 'Customer') {
    TestBed.inject(AccessTokenStore).set({ accessToken: 'test', identifier: 'staff', role });
  }
  it('sends anonymous users to login with return route', () => {
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(result).toEqual(
      TestBed.inject(Router).createUrlTree(['/login'], {
        queryParams: { returnUrl: '/owner/branches' },
      }),
    );
  });
  it('forbids managers from Owner routes and lets Owner through', () => {
    session('BranchManager');
    expect(TestBed.runInInjectionContext(() => roleGuard('Owner')(route, state))).toEqual(
      TestBed.inject(Router).createUrlTree(['/forbidden']),
    );
    session('Owner');
    expect(TestBed.runInInjectionContext(() => roleGuard('Owner')(route, state))).toBe(true);
    expect(TestBed.runInInjectionContext(() => authGuard(route, state))).toBe(true);
  });
  it('redirects staff away from login but keeps Customer on login', () => {
    session('Owner');
    expect(TestBed.runInInjectionContext(() => loginGuard(route, state))).toEqual(
      TestBed.inject(Router).createUrlTree(['/owner/branches']),
    );
    session('Customer');
    expect(TestBed.runInInjectionContext(() => loginGuard(route, state))).toBe(true);
  });
});
