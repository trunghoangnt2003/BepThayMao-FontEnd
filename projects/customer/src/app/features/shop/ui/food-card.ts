import { Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuDishDto } from '@bepthaymao/api-client';
import { CartStore, formatVnd } from '../data-access/shop-data';
import { DishThumb } from './shop-ui';

/**
 * Thẻ món dạng lưới của màn Đặt món (theo bản thử): ảnh trên, tên, giá đỏ, nút + tròn thêm một phần vào giỏ.
 * Món tủ (isFeatured) có tem "Món tủ"; món hết ở vài cơ sở có nhãn cảnh báo.
 */
@Component({
  selector: 'cus-food-card',
  imports: [RouterLink, DishThumb],
  template: `
    @let d = dish();
    <a class="fimg" [routerLink]="['/mon', d.id]" tabindex="-1" aria-hidden="true">
      <cus-dish-thumb [name]="d.name" [category]="d.category" [imageUrl]="d.imageUrl" />
      @if (d.isFeatured) {
        <span class="stamp">Món tủ</span>
      }
    </a>
    <div class="fbd">
      <h3>
        <a [routerLink]="['/mon', d.id]">{{ d.name }}</a>
      </h3>
      @if (d.unavailableBranchIds.length > 0) {
        <span class="pill num">Hết ở {{ d.unavailableBranchIds.length }} cơ sở</span>
      }
      <div class="fft">
        <span class="fprice num">{{ formatVnd(d.price) }}</span>
        <button
          class="fadd"
          type="button"
          [attr.aria-label]="'Thêm ' + d.name + ' vào giỏ'"
          (click)="add()"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: grid;
      grid-template-rows: auto 1fr;
      min-width: 0;
      overflow: hidden;
      border: 1px solid var(--fd-line);
      border-radius: 18px;
      background: #fff;
      box-shadow: var(--fd-shadow);
    }
    .fimg {
      position: relative;
      display: block;
      aspect-ratio: 4 / 3;
      background: var(--fd-tile);
    }
    cus-dish-thumb {
      width: 100%;
      height: 100%;
      aspect-ratio: auto;
      border-radius: 0;
    }
    .stamp {
      position: absolute;
      top: 6px;
      right: 6px;
      display: grid;
      place-items: center;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: var(--fd-gold);
      box-shadow: var(--fd-shadow);
      color: var(--fd-on-gold);
      font:
        700 12px/1 'Noto Serif',
        Georgia,
        serif;
      transform: rotate(12deg);
    }
    .fbd {
      display: grid;
      align-content: start;
      gap: 4px;
      min-width: 0;
      padding: 10px 12px 12px;
    }
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 800;
      line-height: 1.3;
    }
    h3 a {
      color: var(--fd-ink);
      text-decoration: none;
    }
    .pill {
      justify-self: start;
      padding: 2px 10px;
      border-radius: 999px;
      background: var(--color-warn-bg);
      color: var(--color-warn);
      font-size: 13px;
      font-weight: 700;
    }
    .fft {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-top: 2px;
    }
    .fprice {
      color: var(--fd-red);
      font:
        700 19px 'Noto Serif',
        Georgia,
        serif;
    }
    .fadd {
      display: grid;
      flex: none;
      place-items: center;
      width: 44px;
      height: 44px;
      border: 0;
      border-radius: 50%;
      background: var(--fd-red);
      box-shadow: 0 4px 10px rgb(123 23 37 / 0.3);
      color: #fff;
      cursor: pointer;
      transition: transform 0.15s ease;
    }
    .fadd svg {
      width: 22px;
      height: 22px;
      fill: none;
      stroke: currentcolor;
      stroke-width: 2.6;
      stroke-linecap: round;
    }
    .fadd:active {
      transform: scale(0.92);
    }
    @media (hover: hover) {
      .fadd:hover {
        background: var(--fd-red-2);
      }
      h3 a:hover {
        color: var(--fd-red);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .fadd {
        transition: none;
      }
    }
  `,
})
export class FoodCard {
  readonly dish = input.required<MenuDishDto>();
  /** Báo tên món vừa thêm để trang đọc thông báo qua vùng role="status". */
  readonly added = output<string>();
  protected readonly formatVnd = formatVnd;
  private readonly cart = inject(CartStore);

  protected add(): void {
    const dish = this.dish();
    this.cart.set(dish, this.cart.quantityOf(dish.id) + 1);
    this.added.emit(dish.name);
  }
}
