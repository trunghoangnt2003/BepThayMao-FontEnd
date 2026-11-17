import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuDishDto } from '@bepthaymao/api-client';
import { CartStore, formatVnd } from '../../shop/data-access/shop-data';
import { DishThumb } from '../../shop/ui/shop-ui';

/** Món quán giới thiệu: hàng thẻ cuộn ngang trên nền đỏ mận, mỗi thẻ có giá thật và nút thêm vào giỏ. */
@Component({
  selector: 'cus-landing-featured',
  imports: [RouterLink, DishThumb],
  template: `
    <section class="featured" id="mon-noi-bat" aria-labelledby="featured-h">
      <div class="featured__head">
        <h2 id="featured-h" class="sec-h" data-float>Món quán giới thiệu</h2>
        <p class="sec-lead">Món bán chạy của quán.</p>
      </div>
      <div class="featured__wrap">
        <ul class="featured__track">
          @for (dish of dishes(); track dish.id) {
            <li class="fcard">
              <a class="ph" [routerLink]="['/mon', dish.id]" tabindex="-1" aria-hidden="true">
                <cus-dish-thumb
                  [name]="dish.name"
                  [category]="dish.category"
                  [imageUrl]="dish.imageUrl"
                />
                <span class="stamp">Món tủ</span>
              </a>
              <div class="bd">
                <h3>
                  <a [routerLink]="['/mon', dish.id]">{{ dish.name }}</a>
                </h3>
                @if (dish.description) {
                  <p>{{ dish.description }}</p>
                }
                <div class="ft">
                  <span class="price num">{{ formatVnd(dish.price) }}</span>
                  <button
                    class="add"
                    type="button"
                    [attr.aria-label]="'Thêm ' + dish.name + ' vào giỏ'"
                    (click)="add(dish)"
                  >
                    <svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d="M12 5v14M5 12h14" /></svg
                    >Thêm
                  </button>
                </div>
              </div>
            </li>
          }
        </ul>
      </div>
      <p class="visually-hidden" role="status">{{ added() }}</p>
    </section>
  `,
  styleUrl: './landing-featured.css',
})
export class LandingFeatured {
  readonly dishes = input.required<readonly MenuDishDto[]>();
  protected readonly formatVnd = formatVnd;
  protected readonly added = signal('');
  private readonly cart = inject(CartStore);

  protected add(dish: MenuDishDto): void {
    this.cart.set(dish, this.cart.quantityOf(dish.id) + 1);
    this.added.set(`Đã thêm ${dish.name} vào giỏ`);
  }
}
