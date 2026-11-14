import { inject, Injectable } from '@angular/core';
import {
  BranchOptionDto,
  CreateOrderRequest,
  OrderCreatedDto,
  OrderDto,
  OrderTrackingDto,
} from '@bepthaymao/api-client';
import { OrdersService } from '@bepthaymao/api-client/endpoints';
import { toApiError } from '@bepthaymao/core';
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

/** Lấy `unavailableDishIds` từ ProblemDetails 409 (OrderConflictProblem); lỗi đã qua problemInterceptor. */
export function unavailableDishIds(error: unknown): string[] {
  return [...(toApiError(error).unavailableDishIds ?? [])];
}
