import { Component, computed, input } from '@angular/core';
import { MenuDishDto } from '@bepthaymao/api-client';

/**
 * Hai dải tên món thật (viết hoa) chạy ngược chiều; landing-motion cho chạy theo tốc độ vuốt.
 * Chỉ trang trí nên ẩn khỏi trình đọc màn hình; tắt animation thì đứng yên.
 */
@Component({
  selector: 'cus-landing-velo',
  template: `
    <section class="velo" aria-hidden="true">
      @for (row of rows(); track row.dir) {
        <div class="band">
          <div class="velo__run" [class.r2]="row.dir === 1" [attr.data-dir]="row.dir">
            @for (name of row.names; track $index) {
              <span>{{ name }}</span>
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
  protected readonly rows = computed(() => {
    const names = this.menu().map((dish) => dish.name.toLocaleUpperCase('vi'));
    const reversed = [...names].reverse();
    return [
      { dir: -1, names: [...names, ...names, ...names, ...names] },
      { dir: 1, names: [...reversed, ...reversed, ...reversed, ...reversed] },
    ];
  });
}
