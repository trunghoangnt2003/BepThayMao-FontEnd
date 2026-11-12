import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AccessTokenStore } from '@bepthaymao/core';
import { formatVnd, ShopAdminService } from './shop-admin.service';

describe('ShopAdminService', () => {
  let http: HttpTestingController;
  let service: ShopAdminService;

  function signIn(role: 'Owner' | 'BranchManager'): void {
    TestBed.inject(AccessTokenStore).set({ identifier: 'staff', role, accessToken: 'token' });
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(ShopAdminService);
  });
  afterEach(() => {
    http.verify();
  });

  it('lets the owner list orders of all branches or one branch without empty filters', () => {
    signIn('Owner');
    service.orders(null, null).subscribe();
    expect(
      http.expectOne((request) => request.url === '/api/v1/owner/orders').request.params.keys(),
    ).toEqual([]);
    service.orders('b1', 'Paid').subscribe();
    const filtered = http.expectOne((request) => request.url === '/api/v1/owner/orders');
    expect(filtered.request.params.get('branchId')).toBe('b1');
    expect(filtered.request.params.get('status')).toBe('Paid');
  });

  it('keeps the manager on manager endpoints that never take a branch id', () => {
    signIn('BranchManager');
    service.orders('b1', null).subscribe();
    const orders = http.expectOne((request) => request.url === '/api/v1/manager/orders');
    expect(orders.request.params.has('branchId')).toBe(false);
    service.setAvailability('b1', 'd1', false).subscribe();
    const toggle = http.expectOne('/api/v1/manager/dishes/d1/availability');
    expect(toggle.request.method).toBe('PUT');
    expect(toggle.request.body).toEqual({ isAvailable: false });
  });

  it('sends owner availability changes to the chosen branch', () => {
    signIn('Owner');
    service.setAvailability('b2', 'd1', true).subscribe();
    expect(http.expectOne('/api/v1/owner/branches/b2/dishes/d1/availability').request.body).toEqual(
      {
        isAvailable: true,
      },
    );
  });

  it('formats prices with a non-breaking space before đ', () => {
    expect(formatVnd(40000)).toBe('40.000\u00a0đ');
  });
});
