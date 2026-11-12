import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthSessionService } from '../../data-access/auth-session.service';
import { LoginPage } from './login-page';
import { AccessTokenStore } from '@bepthaymao/core';

describe('LoginPage', () => {
  const pair = {
    accessToken: 'test-token',
    identifier: 'owner',
    role: 'Owner' as const,
    expiresIn: 900,
  };
  const service = {
    login: vi.fn(() => of(pair)),
    logout: vi.fn(() => of(undefined)),
    store: new AccessTokenStore(),
  };
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthSessionService, useValue: service }],
    });
  });
  it.each([
    ['Owner', '/owner/branches'],
    ['BranchManager', '/manager/settings'],
  ] as const)('sends credentials and opens the %s role home', async (role, home) => {
    service.login.mockReturnValueOnce(of({ ...pair, role } as typeof pair));
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(LoginPage);
    fixture.componentInstance.form.setValue({
      identifier: 'owner',
      password: 'test-password-only',
    });
    fixture.componentInstance.submit();
    await fixture.whenStable();
    expect(service.login).toHaveBeenCalledWith('owner', 'test-password-only');
    expect(navigate).toHaveBeenCalledWith(home);
  });
});
