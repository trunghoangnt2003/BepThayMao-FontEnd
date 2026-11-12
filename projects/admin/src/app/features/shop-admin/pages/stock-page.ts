import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { BranchDishDto, BranchResponse } from '@bepthaymao/api-client';
import { HlmButton } from '@bepthaymao/ui';
import { switchMap } from 'rxjs';
import {
  BranchStock,
  CATEGORY_LABELS,
  formatVnd,
  ShopAdminService,
} from '../data-access/shop-admin.service';

@Component({
  selector: 'adm-stock-page',
  imports: [FormsModule, HlmButton],
  templateUrl: './stock-page.html',
  styleUrl: './shop-admin.css',
})
export class StockPage {
  protected readonly service = inject(ShopAdminService);
  private readonly destroy = inject(DestroyRef);
  protected readonly categories = CATEGORY_LABELS;
  protected readonly formatVnd = formatVnd;
  protected readonly branches = signal<readonly BranchResponse[]>([]);
  protected readonly matrix = signal<readonly BranchStock[]>([]);
  protected readonly state = signal<'loading' | 'loaded' | 'error'>('loading');
  protected readonly message = signal('');
  protected readonly busy = signal<string | null>(null);
  protected branchId = '';

  /** Owner chọn "Tất cả cơ sở" thì xem bảng món × cơ sở; Quản lý luôn xem cơ sở của mình. */
  protected readonly showMatrix = computed(
    () => this.service.isOwner() && this.matrix().length > 1,
  );
  protected readonly rows = computed(() => this.matrix().at(0)?.dishes ?? []);
  protected readonly soldOut = computed(() =>
    this.matrix().reduce(
      (sum, item) => sum + item.dishes.filter((dish) => !dish.isAvailable).length,
      0,
    ),
  );

  constructor() {
    this.load();
  }

  protected load(): void {
    this.state.set('loading');
    const source = this.service.isOwner()
      ? this.service.branches().pipe(
          switchMap((branches) => {
            this.branches.set(branches);
            const chosen = this.branchId
              ? branches.filter((branch) => branch.id === this.branchId)
              : branches;
            return this.service.stockMatrix(chosen);
          }),
        )
      : this.service
          .stock(null)
          .pipe(
            switchMap((dishes) => [
              [{ branch: { id: dishes.at(0)?.branchId ?? '', name: 'Cơ sở của bạn' }, dishes }],
            ]),
          );
    source.pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: (matrix) => {
        this.matrix.set(matrix);
        this.state.set('loaded');
      },
      error: () => {
        this.state.set('error');
      },
    });
  }

  protected available(branchId: string, dishId: string): boolean {
    const branch = this.matrix().find((item) => item.branch.id === branchId);
    return branch?.dishes.find((dish) => dish.dishId === dishId)?.isAvailable ?? true;
  }

  protected toggle(branch: BranchStock['branch'], dish: BranchDishDto): void {
    const next = !this.available(branch.id, dish.dishId);
    const key = `${branch.id}:${dish.dishId}`;
    this.busy.set(key);
    this.service
      .setAvailability(branch.id, dish.dishId, next)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (updated) => {
          this.matrix.update((matrix) =>
            matrix.map((item) =>
              item.branch.id === branch.id
                ? {
                    ...item,
                    dishes: item.dishes.map((value) =>
                      value.dishId === updated.dishId ? updated : value,
                    ),
                  }
                : item,
            ),
          );
          this.message.set(`${branch.name}: ${dish.name} ${next ? 'còn món' : 'hết món'}.`);
          this.busy.set(null);
        },
        error: () => {
          this.message.set(`Không đổi được tình trạng ${dish.name}. Thử lại.`);
          this.busy.set(null);
        },
      });
  }
}
