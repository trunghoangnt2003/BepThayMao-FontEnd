import { Component, input } from '@angular/core';
import { MenuDishDto } from '@bepthaymao/api-client';

/** Dải tên món thật chạy ngang, chỉ để trang trí nên ẩn khỏi trình đọc màn hình. */
@Component({
  selector: 'cus-landing-velo',
  template: `
    <section class="velo" aria-hidden="true">
      @for (row of [1, 2]; track row) {
        <div class="velo__row" [class.velo__row--2]="row === 2">
          <div class="velo__run">
            @for (copy of [1, 2]; track copy) {
              @for (dish of menu(); track dish.id) {
                <span class="velo__name">{{ dish.name }}</span>
              }
            }
          </div>
        </div>
      }
    </section>
  `,
  styleUrl: './landing-velo.css',
})
export class LandingVelo {
  readonly menu = input.required<readonly MenuDishDto[]>();
}
