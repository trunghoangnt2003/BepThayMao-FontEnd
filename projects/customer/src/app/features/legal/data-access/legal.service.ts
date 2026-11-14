import { inject, Injectable } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { PolicyDto, PolicyKind, ShopLegalDto } from '@bepthaymao/api-client';
import { ShopService } from '@bepthaymao/api-client/endpoints';
import { catchError, Observable, of } from 'rxjs';
import { load, Loaded } from '../../shop/data-access/shop-data';

/** Đường dẫn thân thiện cho từng chính sách (/chinh-sach/bao-mat...). */
const POLICIES: readonly (readonly [PolicyKind, string])[] = [
  ['Terms', 'dieu-khoan'],
  ['Privacy', 'bao-mat'],
  ['Delivery', 'giao-nhan'],
  ['Payment', 'thanh-toan'],
  ['Refund', 'doi-tra'],
  ['Complaint', 'khieu-nai'],
];
const SLUGS = new Map<PolicyKind, string>(POLICIES);

export function slugOf(kind: PolicyKind): string {
  return SLUGS.get(kind) ?? kind.toLowerCase();
}

export function kindOfSlug(slug: string | null): PolicyKind | null {
  return POLICIES.find(([, value]) => value === slug)?.[0] ?? null;
}

/** Chân trang theo quy định thương mại điện tử: thông tin người bán và chính sách do chủ quán nhập. */
@Injectable({ providedIn: 'root' })
export class LegalService {
  private readonly shop = inject(ShopService);

  /** Lỗi mạng thì chân trang chỉ hiện phần cố định, không chặn trang. */
  footer(): Observable<ShopLegalDto | null> {
    return this.shop.getShopLegal().pipe(catchError(() => of(null)));
  }

  policy(kind: PolicyKind): Observable<PolicyDto> {
    return this.shop.getShopPolicy(kind);
  }
}

export const policyResolver: ResolveFn<Loaded<PolicyDto> | null> = (route) => {
  const kind = kindOfSlug(route.paramMap.get('slug'));
  return kind ? load(inject(LegalService).policy(kind)) : of(null);
};
