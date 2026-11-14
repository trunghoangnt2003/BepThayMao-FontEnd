import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { OrderApi } from './order-api';

describe('OrderApi', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('sends branch options with or without a location', async () => {
    const api = TestBed.inject(OrderApi);
    const http = TestBed.inject(HttpTestingController);
    const withLocation = firstValueFrom(api.branchOptions(['d1'], { lat: 10.7, lng: 106.7 }));
    const request = http.expectOne((req) => req.url.endsWith('/checkout/branch-options'));
    expect(request.request.body).toEqual({
      dishIds: ['d1'],
      deliveryLat: 10.7,
      deliveryLng: 106.7,
    });
    request.flush([]);
    await withLocation;
    const without = firstValueFrom(api.branchOptions(['d1'], null));
    const second = http.expectOne((req) => req.url.endsWith('/checkout/branch-options'));
    expect(second.request.body).toEqual({ dishIds: ['d1'], deliveryLat: null, deliveryLng: null });
    second.flush([]);
    await without;
  });

  it('tracks and cancels an order by code and phone', async () => {
    const api = TestBed.inject(OrderApi);
    const http = TestBed.inject(HttpTestingController);
    const tracked = firstValueFrom(api.track('BTM123456', '0901234567'));
    const track = http.expectOne((req) => req.url.endsWith('/orders/BTM123456'));
    expect(track.request.params.get('phone')).toBe('0901234567');
    track.flush({ order: { code: 'BTM123456' }, payment: null });
    expect((await tracked).order.code).toBe('BTM123456');
    const cancelled = firstValueFrom(api.cancel('BTM123456', '0901234567'));
    const cancel = http.expectOne((req) => req.url.endsWith('/orders/BTM123456/cancel'));
    expect(cancel.request.body).toEqual({ code: 'BTM123456', phone: '0901234567' });
    cancel.flush({ code: 'BTM123456' });
    expect((await cancelled).code).toBe('BTM123456');
    http.verify();
  });
});
