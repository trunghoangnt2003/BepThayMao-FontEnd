import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ManagerBranchView } from '@bepthaymao/api-client';
import { ManagerSettingsService } from './manager-settings.service';

const view: ManagerBranchView = {
  phone: '0901234567',
  openTime: '06:00',
  closeTime: '21:30',
  abandonedThresholdMinutes: 10,
  zaloRecipientIds: ['zalo-1'],
  name: 'Cơ sở Mẫu 1',
  address: 'Số 1 Đường Mẫu',
  isActive: true,
  bankAccountNo: null,
  bankCode: null,
  sepayAccountRef: null,
};

describe('ManagerSettingsService', () => {
  let http: HttpTestingController;
  let service: ManagerSettingsService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(ManagerSettingsService);
  });
  afterEach(() => {
    http.verify();
  });

  it('reads the own-branch settings through getManagerBranchSettings', () => {
    const received = vi.fn();
    service.get().subscribe(received);
    const request = http.expectOne('/api/v1/manager/branch/settings');
    expect(request.request.method).toBe('GET');
    request.flush(view);
    expect(received).toHaveBeenCalledWith(view);
  });

  it('sends exactly the five manager-editable keys', () => {
    const body = {
      phone: '0901234567',
      openTime: '07:00',
      closeTime: '20:00',
      abandonedThresholdMinutes: 15,
      zaloRecipientIds: ['zalo-1'],
    };
    const received = vi.fn();
    service
      .update({ ...body, name: 'Không được gửi', bankCode: 'X' } as typeof body)
      .subscribe(received);
    const request = http.expectOne('/api/v1/manager/branch/settings');
    expect(request.request.method).toBe('PUT');
    expect(Object.keys(request.request.body as object).sort()).toEqual(Object.keys(body).sort());
    expect(request.request.body).toEqual(body);
    request.flush(view);
    expect(received).toHaveBeenCalledWith(view);
  });
});
