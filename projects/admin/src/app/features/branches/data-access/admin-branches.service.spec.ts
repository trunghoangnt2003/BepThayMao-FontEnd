import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideCore } from '@bepthaymao/core';
import { firstValueFrom } from 'rxjs';
import { AdminBranchesService } from './admin-branches.service';

describe('AdminBranchesService', () => {
  let controller: HttpTestingController;
  let service: AdminBranchesService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideCore(), provideHttpClientTesting()] });
    controller = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AdminBranchesService);
  });

  afterEach(() => {
    controller.verify();
  });

  it('returns the public branches from the generated client', async () => {
    const branch = {
      id: 'a',
      name: 'Cơ sở Mẫu 1',
      address: 'Số 1',
      phone: '02800000001',
      openTime: '06:00',
      closeTime: '21:30',
    };
    const result = firstValueFrom(service.list());
    controller.expectOne('/api/v1/branches').flush([branch]);
    expect(await result).toEqual([branch]);
  });

  it('fails with an ApiError carrying the correlation id', async () => {
    const result = firstValueFrom(service.list());
    controller
      .expectOne('/api/v1/branches')
      .flush({ title: 'Lỗi', correlationId: 'corr-9' }, { status: 503, statusText: 'Unavailable' });
    await expect(result).rejects.toEqual({
      kind: 'http',
      status: 503,
      title: 'Lỗi',
      correlationId: 'corr-9',
    });
  });
});
