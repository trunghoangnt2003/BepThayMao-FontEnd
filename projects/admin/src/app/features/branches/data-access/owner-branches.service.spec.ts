import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BranchResponse, CreateBranchRequest } from '@bepthaymao/api-client';
import { OwnerBranchesService } from './owner-branches.service';

const branch: BranchResponse = {
  id: '019a5dc0-0001-7000-8000-000000000001',
  name: 'Cơ sở Mẫu 1',
  address: 'Số 1 Đường Mẫu',
  lat: 10.7769,
  lng: 106.7009,
  phone: '0901234567',
  isActive: true,
  openTime: '06:00',
  closeTime: '21:30',
  abandonedThresholdMinutes: 10,
  zaloRecipientIds: [],
  bankAccountNo: null,
  bankCode: null,
  sepayAccountRef: null,
  managerIdentifier: 'quanly-1',
};

describe('OwnerBranchesService', () => {
  let http: HttpTestingController;
  let service: OwnerBranchesService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(OwnerBranchesService);
  });
  afterEach(() => {
    http.verify();
  });

  it('lists the owner branches through listOwnerBranches', () => {
    const received = vi.fn();
    service.list().subscribe(received);
    const request = http.expectOne('/api/v1/owner/branches');
    expect(request.request.method).toBe('GET');
    request.flush([branch]);
    expect(received).toHaveBeenCalledWith([branch]);
  });

  it('creates a branch with the exact branch and manager body', () => {
    const body: CreateBranchRequest = {
      branch: {
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        lat: branch.lat,
        lng: branch.lng,
        openTime: '06:00',
        closeTime: '21:30',
        abandonedThresholdMinutes: 10,
        zaloRecipientIds: [],
        isActive: true,
      },
      manager: { identifier: 'quanly-1', password: 'mat-khau-dai-10' },
    };
    const received = vi.fn();
    service.create(body).subscribe(received);
    const request = http.expectOne('/api/v1/owner/branches');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush(branch);
    expect(received).toHaveBeenCalledWith(branch);
  });

  it('gets one branch through getOwnerBranch', () => {
    const received = vi.fn();
    service.get(branch.id).subscribe(received);
    const request = http.expectOne(`/api/v1/owner/branches/${branch.id}`);
    expect(request.request.method).toBe('GET');
    request.flush(branch);
    expect(received).toHaveBeenCalledWith(branch);
  });
});
