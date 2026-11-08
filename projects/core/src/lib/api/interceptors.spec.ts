import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideCore } from '../provide-core';

describe('Core HTTP configuration', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideCore({ apiBaseUrl: 'http://api:5080/' }), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  it('prefixes only local API paths', () => {
    http.get('/api/v1/branches').subscribe();
    controller.expectOne('http://api:5080/api/v1/branches').flush([]);
    http.get('/assets/logo.svg').subscribe();
    controller.expectOne('/assets/logo.svg').flush('image');
    http.get('https://other.example/api/v1/branches').subscribe();
    controller.expectOne('https://other.example/api/v1/branches').flush([]);
  });

  it('converts HTTP errors once at the interceptor boundary', () => {
    let received: unknown;
    http.get('/api/v1/branches').subscribe({
      error: (error: unknown) => {
        received = error;
      },
    });
    controller
      .expectOne('http://api:5080/api/v1/branches')
      .flush(
        { title: 'Unavailable', correlationId: 'trace-1' },
        { status: 503, statusText: 'Unavailable' },
      );
    expect(received).toEqual({
      kind: 'http',
      status: 503,
      title: 'Unavailable',
      correlationId: 'trace-1',
    });
  });
});
