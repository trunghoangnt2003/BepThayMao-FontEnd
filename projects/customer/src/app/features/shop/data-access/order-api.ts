import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  BranchOptionDto,
  CreateOrderRequest,
  OrderCreatedDto,
  OrderDto,
  OrderTrackingDto,
} from '@bepthaymao/api-client';
import { OrdersService } from '@bepthaymao/api-client/endpoints';
import { Observable } from 'rxjs';

/** Lời gọi API của luồng đặt đơn; trang (view) không gọi client sinh tự động trực tiếp. */
@Injectable({ providedIn: 'root' })
export class OrderApi {
  private readonly api = inject(OrdersService);

  branchOptions(
    dishIds: readonly string[],
    location: { lat: number; lng: number } | null,
  ): Observable<BranchOptionDto[]> {
    return this.api.getBranchOptions({
      dishIds: [...dishIds],
      deliveryLat: location?.lat ?? null,
      deliveryLng: location?.lng ?? null,
    });
  }

  create(request: CreateOrderRequest): Observable<OrderCreatedDto> {
    return this.api.createOrder(request);
  }

  track(code: string, phone: string): Observable<OrderTrackingDto> {
    return this.api.getOrder(code, { phone });
  }

  cancel(code: string, phone: string): Observable<OrderDto> {
    return this.api.cancelOrder(code, { code, phone });
  }
}

/** Lấy `unavailableDishIds` từ ProblemDetails 409 (OrderConflictProblem). */
export function unavailableDishIds(error: unknown): string[] {
  if (!(error instanceof HttpErrorResponse)) return [];
  const body: unknown = error.error;
  if (body === null || typeof body !== 'object') return [];
  const ids: unknown = Reflect.get(body, 'unavailableDishIds');
  return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : [];
}
