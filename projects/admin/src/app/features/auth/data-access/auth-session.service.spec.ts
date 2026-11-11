import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '@bepthaymao/api-client/endpoints';
import { AccessTokenStore } from '@bepthaymao/core';
import { firstValueFrom, of, throwError } from 'rxjs';
import { AuthSessionService } from './auth-session.service';

describe('AuthSessionService login and logout', () => {
  const pair = {
    accessToken: 'test-token',
    identifier: 'owner',
    role: 'Owner' as const,
    expiresIn: 900,
  };
  const api = { login: vi.fn(() => of(pair)), logout: vi.fn(() => of(undefined)) };
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: api }],
    });
  });
  it('calls the generated login API and saves its result in memory', async () => {
    const service = TestBed.inject(AuthSessionService);
    await firstValueFrom(service.login('owner', 'test-password-only'));
    expect(api.login).toHaveBeenCalledWith({ identifier: 'owner', password: 'test-password-only' });
    expect(TestBed.inject(AccessTokenStore).accessToken()).toBe(pair.accessToken);
  });
  it('clears session after logout even when the API fails', async () => {
    const store = TestBed.inject(AccessTokenStore);
    store.set(pair);
    api.logout.mockReturnValueOnce(throwError(() => new Error('offline')));
    await firstValueFrom(TestBed.inject(AuthSessionService).logout());
    expect(api.logout).toHaveBeenCalledOnce();
    expect(store.session()).toBeNull();
  });
});
