import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { ResolveFn } from '@angular/router';
import {
  DishCategory,
  MenuDishDetailDto,
  MenuDishDto,
  ShopContentDto,
} from '@bepthaymao/api-client';
import { MenuService, ShopService } from '@bepthaymao/api-client/endpoints';
import { ApiError, toApiError } from '@bepthaymao/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

export type Loaded<T> =
  | { readonly kind: 'loaded'; readonly value: T }
  | { readonly kind: 'error'; readonly error: ApiError };

export function load<T>(source: Observable<T>): Observable<Loaded<T>> {
  return source.pipe(
    map((value): Loaded<T> => ({ kind: 'loaded', value })),
    catchError((error: unknown) => of<Loaded<T>>({ kind: 'error', error: toApiError(error) })),
  );
}

export interface HomeData {
  readonly menu: readonly MenuDishDto[];
  readonly content: ShopContentDto;
}

export const homeResolver: ResolveFn<Loaded<HomeData>> = () =>
  load(
    forkJoin({
      menu: inject(MenuService).getMenu(),
      content: inject(ShopService).getShopContent(),
    }),
  );

export const menuResolver: ResolveFn<Loaded<readonly MenuDishDto[]>> = () =>
  load(inject(MenuService).getMenu());

export const dishResolver: ResolveFn<Loaded<MenuDishDetailDto>> = (route) =>
  load(inject(MenuService).getMenuDish(route.paramMap.get('dishId') ?? ''));

export const CATEGORY_LABELS: Record<DishCategory, string> = {
  XoiMan: 'Xôi mặn',
  XoiNgot: 'Xôi ngọt',
  Chay: 'Chay',
};

export const CATEGORY_ORDER: readonly DishCategory[] = ['XoiMan', 'XoiNgot', 'Chay'];

/** 35.000 đ: Intl vi-VN và dấu cách không ngắt trước "đ" (UI-SPEC P2 Typography). */
/** Khóa tìm kiếm: bỏ dấu tiếng Việt, đ thành d, chữ thường, gộp khoảng trắng. */
export function searchKey(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchesQuery(name: string, query: string): boolean {
  const key = searchKey(query);
  return key === '' || searchKey(name).includes(key);
}

export function formatVnd(value: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(value)}\u00a0đ`;
}

export interface CartLine {
  readonly dishId: string;
  readonly name: string;
  readonly price: number;
  readonly category: DishCategory;
  readonly quantity: number;
}

const CART_KEY = 'btm.cart';
const ORDERS_KEY = 'btm.orders';

/** Giỏ theo quán (không theo cơ sở, D-13), lưu sessionStorage khi chạy trên trình duyệt. */
@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly state = signal<readonly CartLine[]>(this.read());
  readonly lines = this.state.asReadonly();
  readonly count = computed(() => this.state().reduce((sum, line) => sum + line.quantity, 0));
  readonly total = computed(() =>
    this.state().reduce((sum, line) => sum + line.quantity * line.price, 0),
  );

  quantityOf(dishId: string): number {
    return this.state().find((line) => line.dishId === dishId)?.quantity ?? 0;
  }

  set(dish: Pick<MenuDishDto, 'id' | 'name' | 'price' | 'category'>, quantity: number): void {
    const clamped = Math.max(0, Math.min(99, Math.trunc(quantity)));
    const others = this.state().filter((line) => line.dishId !== dish.id);
    const next =
      clamped === 0
        ? others
        : [
            ...others,
            {
              dishId: dish.id,
              name: dish.name,
              price: dish.price,
              category: dish.category,
              quantity: clamped,
            },
          ];
    this.state.set(next);
    this.write(CART_KEY, next);
  }

  remove(dishIds: readonly string[]): void {
    const next = this.state().filter((line) => !dishIds.includes(line.dishId));
    this.state.set(next);
    this.write(CART_KEY, next);
  }

  clear(): void {
    this.state.set([]);
    this.write(CART_KEY, []);
  }

  /** Nhớ số điện thoại của đơn vừa đặt trong phiên để trang đơn mở không cần nhập lại. */
  rememberOrder(code: string, phone: string): void {
    const orders = { ...this.readObject(ORDERS_KEY), [code]: phone };
    this.write(ORDERS_KEY, orders);
  }

  phoneFor(code: string): string | null {
    const value: unknown = new Map(Object.entries(this.readObject(ORDERS_KEY))).get(code);
    return typeof value === 'string' ? value : null;
  }

  private read(): readonly CartLine[] {
    if (!this.browser) return [];
    try {
      const parsed: unknown = JSON.parse(sessionStorage.getItem(CART_KEY) ?? '[]');
      return Array.isArray(parsed)
        ? (parsed as CartLine[]).filter((line) => line.quantity > 0)
        : [];
    } catch {
      return [];
    }
  }

  private readObject(key: string): Record<string, unknown> {
    if (!this.browser) return {};
    try {
      const parsed: unknown = JSON.parse(sessionStorage.getItem(key) ?? '{}');
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }

  private write(key: string, value: unknown): void {
    if (!this.browser) return;
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Chế độ riêng tư hoặc bộ nhớ bị chặn: giỏ vẫn chạy trong phiên trang.
    }
  }
}
