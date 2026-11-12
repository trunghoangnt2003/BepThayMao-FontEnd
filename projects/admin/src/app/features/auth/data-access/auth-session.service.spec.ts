import { TestBed } from '@angular/core/testing';
import { AuthService } from '@bepthaymao/api-client/endpoints';
import { AccessTokenStore } from '@bepthaymao/core';
import { firstValueFrom, of, throwError } from 'rxjs';
import { AuthSessionService } from './auth-session.service';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideCore } from '@bepthaymao/core';
import { provideRouter, Router } from '@angular/router';

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

describe('session restoration', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideCore(), provideHttpClientTesting(), provideRouter([])],
    }),
  );
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });
  it('restores a refresh cookie session and accepts anonymous startup failure', () => {
    const service = TestBed.inject(AuthSessionService);
    const values: unknown[] = [];
    service.restore().subscribe((value) => values.push(value));
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/auth/refresh')
      .flush({ accessToken: 'new', identifier: 'owner', role: 'Owner', expiresIn: 900 });
    expect(service.store.accessToken()).toBe('new');
    service.store.clear();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    service.restore().subscribe((value) => values.push(value));
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/auth/refresh')
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(values[1]).toBeNull();
    expect(navigate).not.toHaveBeenCalled();
  });
  it('shares one refresh HTTP request across concurrent subscribers', () => {
    const service = TestBed.inject(AuthSessionService);
    const values: string[] = [];
    service.refreshOnce().subscribe({ next: (value) => values.push(value), error: vi.fn() });
    service.refreshOnce().subscribe({ next: (value) => values.push(value), error: vi.fn() });
    service.refreshOnce().subscribe({ next: (value) => values.push(value), error: vi.fn() });
    const requests = TestBed.inject(HttpTestingController).match('/api/v1/auth/refresh');
    expect(requests).toHaveLength(1);
    requests[0]?.flush({ accessToken: 'new', identifier: 'owner', role: 'Owner', expiresIn: 900 });
    expect(values).toEqual(['new', 'new', 'new']);
  });
  it('clears an expired live session and routes back to login', () => {
    const service = TestBed.inject(AuthSessionService);
    service.store.set({ accessToken: 'expired', identifier: 'owner', role: 'Owner' });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    service.refreshOnce().subscribe({ error: vi.fn() });
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/auth/refresh')
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(service.store.session()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { reason: 'expired', returnUrl: '/' },
    });
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
