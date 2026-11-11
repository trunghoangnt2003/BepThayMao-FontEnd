import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '@bepthaymao/api-client/endpoints';
import { AccessTokenStore } from '@bepthaymao/core';
import { firstValueFrom, of, throwError } from 'rxjs';
import { AuthSessionService } from './auth-session.service';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideCore } from '@bepthaymao/core';

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

describe('AuthSessionService generated HTTP contract', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ providers: [provideCore(), provideHttpClientTesting()] }),
  );
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });
  it('uses login and logout POST contracts and clears the session', () => {
    const service = TestBed.inject(AuthSessionService);
    service.login('owner', 'mock-password-only').subscribe();
    const login = TestBed.inject(HttpTestingController).expectOne('/api/v1/auth/login');
    expect(login.request.method).toBe('POST');
    expect(login.request.body).toEqual({ identifier: 'owner', password: 'mock-password-only' });
    login.flush({ accessToken: 'mock-token', identifier: 'owner', role: 'Owner', expiresIn: 900 });
    service.logout().subscribe();
    const logout = TestBed.inject(HttpTestingController).expectOne('/api/v1/auth/logout');
    expect(logout.request.method).toBe('POST');
    logout.flush(null, { status: 204, statusText: 'No Content' });
    expect(service.store.session()).toBeNull();
  });
});
