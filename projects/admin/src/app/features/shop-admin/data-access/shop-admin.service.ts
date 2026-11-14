import { inject, Injectable } from '@angular/core';
import {
  BannerDto,
  BannerInputRequest,
  BranchDishDto,
  BranchResponse,
  DishDto,
  DishInputRequest,
  LegalInputRequest,
  OrderDto,
  OrderStatus,
  OwnerLegalDto,
  PolicyDto,
  PolicyKind,
  ShopContentDto,
} from '@bepthaymao/api-client';
import { ManagerService, OwnerService, ShopService } from '@bepthaymao/api-client/endpoints';
import { AccessTokenStore } from '@bepthaymao/core';
import { forkJoin, map, Observable, of } from 'rxjs';

/** Một cơ sở và tình trạng còn món của nó (bảng món × cơ sở của Owner). */
export interface BranchStock {
  readonly branch: Pick<BranchResponse, 'id' | 'name'>;
  readonly dishes: readonly BranchDishDto[];
}

/**
 * Lời gọi API cho Vận hành và Quản trị. Owner là superadmin trên cơ sở của mình (FR-003a): dùng /owner/*,
 * Quản lý dùng /manager/* (không nhận branchId).
 */
@Injectable({ providedIn: 'root' })
export class ShopAdminService {
  private readonly owner = inject(OwnerService);
  private readonly manager = inject(ManagerService);
  private readonly store = inject(AccessTokenStore);
  private readonly shop = inject(ShopService);

  isOwner(): boolean {
    return this.store.session()?.role === 'Owner';
  }

  branches(): Observable<BranchResponse[]> {
    return this.isOwner() ? this.owner.listOwnerBranches() : of([]);
  }

  orders(branchId: string | null, status: OrderStatus | null): Observable<OrderDto[]> {
    // Tham số query bỏ qua khi không lọc (client sinh tự động nhận undefined, không nhận null).
    const filters = { ...(status ? { status } : {}) };
    return this.isOwner()
      ? this.owner.listOwnerOrders({ ...filters, ...(branchId ? { branchId } : {}) })
      : this.manager.listManagerOrders(filters);
  }

  stock(branchId: string | null): Observable<BranchDishDto[]> {
    if (!this.isOwner()) return this.manager.listManagerDishes();
    return branchId ? this.owner.listOwnerBranchDishes(branchId) : of([]);
  }

  stockMatrix(branches: readonly Pick<BranchResponse, 'id' | 'name'>[]): Observable<BranchStock[]> {
    if (branches.length === 0) return of([]);
    return forkJoin(
      branches.map((branch) =>
        this.owner.listOwnerBranchDishes(branch.id).pipe(map((dishes) => ({ branch, dishes }))),
      ),
    );
  }

  setAvailability(
    branchId: string,
    dishId: string,
    isAvailable: boolean,
  ): Observable<BranchDishDto> {
    return this.isOwner()
      ? this.owner.setOwnerDishAvailability(branchId, dishId, { isAvailable })
      : this.manager.setManagerDishAvailability(dishId, { isAvailable });
  }

  dishes(): Observable<DishDto[]> {
    return this.owner.listOwnerDishes();
  }

  saveDish(id: string | null, input: DishInputRequest): Observable<DishDto> {
    return id ? this.owner.updateOwnerDish(id, input) : this.owner.createOwnerDish(input);
  }

  deleteDish(id: string): Observable<void> {
    return this.owner.deleteOwnerDish(id);
  }

  banners(): Observable<BannerDto[]> {
    return this.owner.listOwnerBanners();
  }

  saveBanner(id: string | null, input: BannerInputRequest): Observable<BannerDto> {
    return id ? this.owner.updateOwnerBanner(id, input) : this.owner.createOwnerBanner(input);
  }

  deleteBanner(id: string): Observable<void> {
    return this.owner.deleteOwnerBanner(id);
  }

  content(): Observable<ShopContentDto> {
    return this.shop.getShopContent();
  }

  saveAbout(about: string): Observable<ShopContentDto> {
    return this.owner.updateOwnerAbout({ about });
  }

  legal(): Observable<OwnerLegalDto> {
    return this.owner.getOwnerLegal();
  }

  saveLegal(input: LegalInputRequest): Observable<OwnerLegalDto> {
    return this.owner.updateOwnerLegal(input);
  }

  savePolicy(kind: PolicyKind, body: string): Observable<PolicyDto> {
    return this.owner.updateOwnerPolicy(kind, { body });
  }
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PendingPayment: 'Chờ thanh toán',
  Paid: 'Đã thanh toán, chờ nhận',
  Accepted: 'Đã nhận đơn',
  Preparing: 'Đang chuẩn bị',
  Delivering: 'Đang giao',
  Completed: 'Đã hoàn thành',
  Cancelled: 'Đã hủy',
};

export const CATEGORY_LABELS = { XoiMan: 'Xôi mặn', XoiNgot: 'Xôi ngọt', Chay: 'Chay' } as const;

export function formatVnd(value: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(value)}\u00a0đ`;
}

export function formatTime(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    hour12: false,
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value));
}
