import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DishCategory, MenuDishDto } from '@bepthaymao/api-client';
import { BtmClickSpark } from '@bepthaymao/ui';
import { CartStore, formatVnd } from '../data-access/shop-data';

/** Ảnh món chủ quán tải lên; chưa có ảnh thì là khung ánh bếp theo nhóm món (không dùng ảnh kho, Floor 8). */
@Component({
  selector: 'cus-dish-thumb',
  template: `
    @if (imageUrl(); as src) {
      <img [src]="src" [alt]="'Ảnh món ' + name()" loading="lazy" width="96" height="96" />
    } @else {
      <span class="swatch" [attr.data-category]="category()" aria-hidden="true"></span>
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
      --h: 75;
      display: block;
      background:
        radial-gradient(
          ellipse 60% 50% at 58% 42%,
          oklch(80% 0.13 var(--h) / 0.95),
          transparent 70%
        ),
        radial-gradient(
          ellipse 45% 40% at 28% 75%,
          oklch(62% 0.14 calc(var(--h) - 25) / 0.75),
          transparent 70%
        ),
        linear-gradient(160deg, oklch(42% 0.05 55), oklch(22% 0.03 50));
    }
    .swatch[data-category='XoiNgot'] {
      --h: 32;
    }
    .swatch[data-category='Chay'] {
      --h: 140;
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
  imports: [BtmClickSpark],
  template: `
    @let quantity = cart.quantityOf(dish().id);
    <span class="stepper" role="group" [attr.aria-label]="'Số lượng ' + dish().name">
      @if (quantity > 0) {
        <button
          type="button"
          class="round"
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
        btmClickSpark
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
      border-radius: var(--radius-pill);
      background: var(--cocoa);
      color: var(--gold);
      box-shadow: 0 6px 16px oklch(25% 0.04 50 / 0.3);
    }
    .round {
      --fx-spark: var(--color-accent);
      position: relative;
      display: grid;
      place-items: center;
      width: 42px;
      height: 42px;
      border: 0;
      border-radius: var(--radius-pill);
      background: transparent;
      color: inherit;
      cursor: pointer;
      transition: transform 300ms var(--spring);
    }
    .round:hover:not(:disabled) {
      transform: scale(1.1);
    }
    .round:active:not(:disabled) {
      transform: scale(0.9);
    }
    .round:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .count {
      min-width: 2ch;
      color: var(--on-cocoa);
      text-align: center;
      font-weight: var(--weight-heavy);
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

/** Thẻ món: chữ trái (tên là liên kết chi tiết, mô tả 2 dòng, giá), ảnh phải có nút thêm ở góc. */
@Component({
  selector: 'cus-dish-row',
  imports: [RouterLink, DishThumb, QtyStepper],
  template: `
    <div class="text">
      <a class="name" [routerLink]="['/mon', dish().id]">{{ dish().name }}</a>
      @if (dish().description) {
        <p class="desc">{{ dish().description }}</p>
      }
      @if (soldOutEverywhere()) {
        <span class="soldout">Hết ở mọi cơ sở</span>
      } @else {
        <span class="price num">{{ price() }}</span>
      }
    </div>
    <div class="pic">
      <cus-dish-thumb
        [name]="dish().name"
        [category]="dish().category"
        [imageUrl]="dish().imageUrl"
      />
      @if (!soldOutEverywhere()) {
        <cus-qty-stepper class="ctl" [dish]="dish()" />
      }
    </div>
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 100px;
      gap: var(--space-sm);
      padding: 12px 12px 12px 16px;
      border-radius: var(--radius-card);
      background: var(--color-paper-2);
      box-shadow: 0 2px 10px oklch(35% 0.05 50 / 0.05);
      transition: transform 300ms var(--spring);
    }
    :host(:hover) {
      transform: translateY(-2px);
    }
    .text {
      display: grid;
      gap: 4px;
      align-content: start;
      min-width: 0;
    }
    .name {
      color: var(--color-ink);
      font-weight: var(--weight-heavy);
      text-decoration: none;
      overflow-wrap: anywhere;
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
    .price {
      margin-top: 4px;
      color: var(--color-accent);
      font-weight: var(--weight-heavy);
    }
    .soldout {
      justify-self: start;
      margin-top: 4px;
      padding: 2px 10px;
      border-radius: var(--radius-pill);
      background: var(--color-paper-3);
      color: var(--color-muted);
      font-size: var(--text-sm);
      font-weight: var(--weight-strong);
    }
    .pic {
      position: relative;
      align-self: start;
    }
    .pic cus-dish-thumb {
      border-radius: 16px;
    }
    .ctl {
      position: absolute;
      right: 6px;
      bottom: 6px;
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
        <a class="btn btn--gold fx-shine" routerLink="/dat-hang">Đặt hàng</a>
      </div>
    }
  `,
  styles: `
    :host {
      position: sticky;
      bottom: 0;
      z-index: var(--z-sticky);
      display: block;
      margin-inline: calc(-1 * var(--gutter));
      padding: var(--space-lg) var(--gutter)
        calc(var(--space-sm) + env(safe-area-inset-bottom, 0px));
      background: linear-gradient(transparent, var(--color-paper) 45%);
      pointer-events: none;
    }
    :host:empty {
      display: none;
    }
    .bar {
      pointer-events: auto;
    }
    .bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-md);
      padding: 8px 8px 8px 20px;
      border-radius: var(--radius-pill);
      background: var(--cocoa);
      color: var(--on-cocoa);
      box-shadow: var(--shadow-lift);
      animation: rise 450ms var(--spring);
    }
    .sum {
      display: grid;
      line-height: 1.25;
    }
    .sum span {
      color: var(--on-cocoa-2);
      font-size: var(--text-sm);
    }
    .sum strong {
      font-size: var(--text-lg);
      font-weight: var(--weight-heavy);
    }
    @keyframes rise {
      from {
        transform: translateY(24px);
        opacity: 0;
      }
    }
  `,
})
export class CartBar {
  protected readonly cart = inject(CartStore);
  protected readonly total = computed(() => formatVnd(this.cart.total()));
}
