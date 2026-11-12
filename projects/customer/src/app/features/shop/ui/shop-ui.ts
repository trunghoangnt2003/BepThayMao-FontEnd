import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DishCategory, MenuDishDto } from '@bepthaymao/api-client';
import { CartStore, formatVnd } from '../data-access/shop-data';

/** Ảnh món; chưa có ảnh thật thì là ô màu xôi theo nhóm món (không dùng ảnh kho, Floor 8). */
@Component({
  selector: 'cus-dish-thumb',
  template: `
    @if (imageUrl(); as src) {
      <img [src]="src" [alt]="'Ảnh món ' + name()" loading="lazy" width="96" height="96" />
    } @else {
      <span class="swatch" [attr.data-category]="category()">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11h18a9 9 0 0 1-18 0z" /></svg>
      </span>
    }
  `,
  styles: `
    :host {
      display: block;
      aspect-ratio: 1;
      border-radius: var(--radius-card);
      overflow: hidden;
    }
    img,
    .swatch {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .swatch {
      display: grid;
      place-items: center;
      background: var(--xoi-man);
      color: var(--color-ink);
    }
    .swatch[data-category='XoiNgot'] {
      background: var(--xoi-ngot);
      color: var(--on-xoi-dark);
    }
    .swatch[data-category='Chay'] {
      background: var(--xoi-chay);
    }
    svg {
      width: 40%;
      height: 40%;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.4;
      opacity: 0.45;
    }
  `,
})
export class DishThumb {
  readonly name = input.required<string>();
  readonly category = input.required<DishCategory>();
  readonly imageUrl = input<string | null | undefined>(null);
}

/** Nút + tròn; có món trong giỏ thì thành bộ − số +. Không đổi chiều rộng khi số có 2 chữ số. */
@Component({
  selector: 'cus-qty-stepper',
  template: `
    @let quantity = cart.quantityOf(dish().id);
    <span class="stepper" role="group" [attr.aria-label]="'Số lượng ' + dish().name">
      @if (quantity > 0) {
        <button
          type="button"
          class="round round--quiet"
          (click)="change(-1)"
          [attr.aria-label]="'Bớt ' + dish().name"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" /></svg>
        </button>
        <span class="num count" aria-live="polite">{{ quantity }}</span>
      }
      <button
        type="button"
        class="round"
        (click)="change(1)"
        [disabled]="quantity >= 99"
        [attr.aria-label]="'Thêm ' + dish().name"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
      </button>
    </span>
  `,
  styles: `
    .stepper {
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs);
    }
    .round {
      position: relative;
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      border: 0;
      border-radius: var(--radius-pill);
      background: var(--color-accent);
      color: var(--color-accent-ink);
      cursor: pointer;
      transition: transform var(--dur-micro) var(--ease-out);
    }
    .round::before {
      content: '';
      position: absolute;
      inset: -4px;
    }
    .round:active:not(:disabled) {
      transform: scale(0.94);
    }
    .round:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .round--quiet {
      background: var(--color-paper-2);
      color: var(--color-accent);
      box-shadow: inset 0 0 0 1.5px var(--color-accent);
    }
    .count {
      min-width: 2ch;
      text-align: center;
      font-weight: var(--weight-strong);
    }
    svg {
      width: 18px;
      height: 18px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2.4;
      stroke-linecap: round;
    }
  `,
})
export class QtyStepper {
  protected readonly cart = inject(CartStore);
  readonly dish = input.required<Pick<MenuDishDto, 'id' | 'name' | 'price' | 'category'>>();

  change(delta: number): void {
    this.cart.set(this.dish(), this.cart.quantityOf(this.dish().id) + delta);
  }
}

/** Dòng món: ảnh trái, tên là liên kết chi tiết, mô tả 2 dòng, giá và nút thêm. */
@Component({
  selector: 'cus-dish-row',
  imports: [RouterLink, DishThumb, QtyStepper],
  template: `
    <cus-dish-thumb
      [name]="dish().name"
      [category]="dish().category"
      [imageUrl]="dish().imageUrl"
    />
    <div class="text">
      <a class="name" [routerLink]="['/mon', dish().id]">{{ dish().name }}</a>
      @if (dish().description) {
        <p class="desc">{{ dish().description }}</p>
      }
      <div class="bottom">
        <span class="price num">{{ price() }}</span>
        @if (soldOutEverywhere()) {
          <span class="soldout">Hết món</span>
        } @else {
          <cus-qty-stepper [dish]="dish()" />
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: 88px minmax(0, 1fr);
      gap: var(--space-sm);
      padding-block: var(--space-sm);
    }
    :host + :host {
      border-top: var(--rule-hair) solid var(--color-rule);
    }
    .text {
      display: grid;
      gap: 2px;
      align-content: start;
      min-width: 0;
    }
    .name {
      color: var(--color-ink);
      font-weight: var(--weight-strong);
      text-decoration: none;
      overflow-wrap: anywhere;
      min-height: 24px;
    }
    .name:hover {
      text-decoration: underline;
    }
    .desc {
      color: var(--color-ink-2);
      font-size: var(--text-sm);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-xs);
      margin-top: var(--space-xs);
    }
    .price {
      color: var(--color-accent);
      font-weight: var(--weight-heavy);
    }
    .soldout {
      font-size: var(--text-sm);
      color: var(--color-muted);
      font-weight: var(--weight-strong);
    }
  `,
})
export class DishRow {
  readonly dish = input.required<MenuDishDto>();
  readonly branchCount = input(0);
  protected readonly price = computed(() => formatVnd(this.dish().price));
  protected readonly soldOutEverywhere = computed(
    () => this.branchCount() > 0 && this.dish().unavailableBranchIds.length >= this.branchCount(),
  );
}

/** Thanh giỏ dính đáy (chỉ hiện khi có món): số món, tạm tính, nút sang bước đặt hàng. */
@Component({
  selector: 'cus-cart-bar',
  imports: [RouterLink],
  template: `
    @if (cart.count() > 0) {
      <div class="bar">
        <div class="sum" role="status" aria-atomic="true">
          <span>{{ cart.count() }} món</span>
          <strong class="num">{{ total() }}</strong>
        </div>
        <a class="btn btn--primary" routerLink="/dat-hang">Tiếp tục đặt hàng</a>
      </div>
    }
  `,
  styles: `
    :host {
      position: sticky;
      bottom: 0;
      z-index: var(--z-sticky);
      display: block;
    }
    .bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-md);
      margin-top: var(--space-md);
      padding: var(--space-sm) var(--space-sm)
        calc(var(--space-sm) + env(safe-area-inset-bottom, 0px)) var(--space-lg);
      border-radius: var(--radius-pill);
      background: var(--color-ink);
      color: var(--color-accent-ink);
      box-shadow: var(--shadow-card);
    }
    .sum {
      display: grid;
      line-height: 1.25;
    }
    .sum span {
      font-size: var(--text-sm);
    }
    .sum strong {
      font-size: var(--text-lg);
    }
    .btn--primary {
      min-height: 48px;
      background: var(--color-main);
      border-color: var(--color-main);
      color: var(--color-ink);
    }
  `,
})
export class CartBar {
  protected readonly cart = inject(CartStore);
  protected readonly total = computed(() => formatVnd(this.cart.total()));
}
