import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AdminBranchesService } from './admin-branches.service';

describe('Admin data access', () => {
  it('uses the generated endpoint', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const received = vi.fn();
    TestBed.inject(AdminBranchesService).list().subscribe(received);
    TestBed.inject(HttpTestingController).expectOne('/api/v1/branches').flush([]);
    expect(received).toHaveBeenCalledWith([]);
    TestBed.inject(HttpTestingController).verify();
  });
});
