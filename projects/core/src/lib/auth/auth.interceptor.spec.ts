import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { provideCore } from '../provide-core';
import { AccessTokenStore } from './access-token-store';
import { TOKEN_REFRESHER } from './token-refresher';

function setup() {
  const refresh = new Subject<string>();
  const refreshOnce = vi.fn(() => refresh);
  TestBed.configureTestingModule({
    providers: [
      provideCore(),
      provideHttpClientTesting(),
      { provide: TOKEN_REFRESHER, useValue: { refreshOnce } },
    ],
  });
  const controller = TestBed.inject(HttpTestingController);
  const http = TestBed.inject(HttpClient);
  TestBed.inject(AccessTokenStore).set({
    accessToken: 'old',
    identifier: 'owner',
    role: 'Owner',
  });
  return { controller, http, refresh, refreshOnce };
}
afterEach(() => {
  TestBed.inject(HttpTestingController).verify();
});
describe('auth request scope', () => {
  it('adds bearer only to local API requests', () => {
    const { http, controller } = setup();
    http.get('/api/v1/owner/branches').subscribe();
    const request = controller.expectOne('/api/v1/owner/branches');
    expect(request.request.headers.get('Authorization')).toBe('Bearer old');
    request.flush([]);
    for (const url of ['/assets/logo.svg', 'https://other.example/api/v1/branches']) {
      http.get(url).subscribe();
      const external = controller.expectOne(url);
      expect(external.request.headers.has('Authorization')).toBe(false);
      external.flush([]);
    }
  });
});
describe('auth retry', () => {
  it('retries concurrent 401 requests after refresh', () => {
    const { http, controller, refresh } = setup();
    const results: unknown[] = [];
    for (let index = 0; index < 3; index++)
      http
        .get('/api/v1/owner/branches')
        .subscribe({ next: (value) => results.push(value), error: vi.fn() });
    for (const request of controller.match('/api/v1/owner/branches'))
      request.flush({}, { status: 401, statusText: 'Unauthorized' });
    refresh.next('new');
    refresh.complete();
    const retried = controller.match('/api/v1/owner/branches');
    expect(retried).toHaveLength(3);
    for (const request of retried) {
      expect(request.request.headers.get('Authorization')).toBe('Bearer new');
      request.flush([]);
    }
    expect(results).toHaveLength(3);
  });
  it('does not refresh auth failures and preserves original error if refresh fails', () => {
    const { http, controller, refresh, refreshOnce } = setup();
    let error: unknown;
    http.post('/api/v1/auth/login', {}).subscribe({
      error: (value: unknown) => {
        error = value;
      },
    });
    controller
      .expectOne('/api/v1/auth/login')
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(refreshOnce).not.toHaveBeenCalled();
    expect(error).toMatchObject({ status: 401 });
    http.get('/api/v1/owner/branches').subscribe({
      error: (value: unknown) => {
        error = value;
      },
    });
    controller
      .expectOne('/api/v1/owner/branches')
      .flush({ correlationId: 'original' }, { status: 401, statusText: 'Unauthorized' });
    refresh.error(new Error('refresh unavailable'));
    expect(error).toMatchObject({ status: 401, correlationId: 'original' });
  });
});
