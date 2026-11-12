import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PublicBranchesService } from './public-branches.service';

describe('Public branches data access', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }),
  );
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });
  it('loads the generated API response', () => {
    const received = vi.fn();
    TestBed.inject(PublicBranchesService).list().subscribe(received);
    TestBed.inject(HttpTestingController).expectOne('/api/v1/branches').flush([]);
    expect(received).toHaveBeenCalledWith({ kind: 'loaded', branches: [] });
  });
  it('normalizes problem details without throwing from the resolver', () => {
    const received = vi.fn();
    TestBed.inject(PublicBranchesService).list().subscribe(received);
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/branches')
      .flush({ correlationId: 'real-id' }, { status: 500, statusText: 'Failure' });
    expect(received).toHaveBeenCalledWith({
      kind: 'error',
      error: { kind: 'http', status: 500, correlationId: 'real-id' },
    });
  });
});
