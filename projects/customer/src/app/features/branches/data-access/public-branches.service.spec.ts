import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideCore } from '@bepthaymao/core';
import { firstValueFrom } from 'rxjs';
import { PublicBranchesService } from './public-branches.service';

const branch = {
  id: '01a1c37b-9dbc-79ea-865c-15c529bb6064',
  name: 'Cơ sở Mẫu 1',
  address: 'Số 1 Đường Mẫu, Phường Mẫu, TP. Mẫu',
  phone: '02800000001',
  openTime: '06:00',
  closeTime: '21:30',
};

describe('PublicBranchesService', () => {
  let controller: HttpTestingController;
  let service: PublicBranchesService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideCore(), provideHttpClientTesting()] });
    controller = TestBed.inject(HttpTestingController);
    service = TestBed.inject(PublicBranchesService);
  });

  afterEach(() => {
    controller.verify();
  });

  it('maps 200 to loaded branches', async () => {
    const result = firstValueFrom(service.list());
    controller.expectOne('/api/v1/branches').flush([branch]);
    expect(await result).toEqual({ kind: 'loaded', branches: [branch] });
  });

  it('maps a problem response to an error with its correlation id', async () => {
    const result = firstValueFrom(service.list());
    controller
      .expectOne('/api/v1/branches')
      .flush(
        { title: 'Lỗi', status: 500, correlationId: 'corr-1' },
        { status: 500, statusText: 'Server Error' },
      );
    expect(await result).toEqual({
      kind: 'error',
      error: { kind: 'http', status: 500, title: 'Lỗi', correlationId: 'corr-1' },
    });
  });
});
