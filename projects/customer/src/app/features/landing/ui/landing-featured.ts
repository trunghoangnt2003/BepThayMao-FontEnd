import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuDishDto } from '@bepthaymao/api-client';
import { formatVnd } from '../../shop/data-access/shop-data';
import { DishThumb } from '../../shop/ui/shop-ui';

/** Món quán giới thiệu: hàng thẻ cuộn ngang, mỗi thẻ là link tới món thật với giá thật. */
@Component({
  selector: 'cus-landing-featured',
  imports: [RouterLink, DishThumb],
  template: `
    <section class="featured" id="mon-noi-bat" aria-labelledby="featured-h">
      <div class="featured__inner">
        <h2 id="featured-h">Món quán giới thiệu</h2>
        <ul class="featured__track">
          @for (dish of dishes(); track dish.id) {
            <li>
              <a [routerLink]="['/mon', dish.id]">
                <cus-dish-thumb
                  [name]="dish.name"
                  [category]="dish.category"
                  [imageUrl]="dish.imageUrl"
                />
                <b>{{ dish.name }}</b>
                @if (dish.description) {
                  <small>{{ dish.description }}</small>
                }
                <span class="num">{{ formatVnd(dish.price) }}</span>
              </a>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
  styleUrl: './landing-featured.css',
})
export class LandingFeatured {
  readonly dishes = input.required<readonly MenuDishDto[]>();
  protected readonly formatVnd = formatVnd;
}
