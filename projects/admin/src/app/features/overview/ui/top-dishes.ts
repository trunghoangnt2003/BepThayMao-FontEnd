import { Component, computed, input } from '@angular/core';
import { OverviewDishDto } from '@bepthaymao/api-client';

/** Món đặt nhiều hôm nay; thanh ngang chỉ minh họa, số phần ghi bằng chữ. */
@Component({
  selector: 'adm-top-dishes',
  template: `
    @if (dishes().length === 0) {
      <p class="empty">Chưa có món nào được đặt hôm nay.</p>
    } @else {
      <ol>
        @for (dish of dishes(); track dish.dishName; let index = $index) {
          <li>
            <span class="tops__rank" aria-hidden="true">{{ index + 1 }}</span>
            <div class="tops__info">
              <b>{{ dish.dishName }}</b>
              <span class="tops__bar" aria-hidden="true"
                ><span [style.width.%]="(dish.quantity / max()) * 100"></span
              ></span>
            </div>
            <span class="qty">{{ dish.quantity }} phần</span>
          </li>
        }
      </ol>
    }
  `,
  styleUrl: './top-dishes.css',
})
export class TopDishesComponent {
  readonly dishes = input.required<readonly OverviewDishDto[]>();
  protected readonly max = computed(() =>
    Math.max(1, ...this.dishes().map((dish) => dish.quantity)),
  );
}
