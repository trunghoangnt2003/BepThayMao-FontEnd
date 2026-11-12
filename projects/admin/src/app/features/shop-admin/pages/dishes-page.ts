import { Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DishCategory, DishDto, DishInputRequest } from '@bepthaymao/api-client';
import { toApiError } from '@bepthaymao/core';
import { HlmButton } from '@bepthaymao/ui';
import { ConfirmDialog } from '../../../shared/dialog/confirm-dialog';
import { CATEGORY_LABELS, formatVnd, ShopAdminService } from '../data-access/shop-admin.service';

const EMPTY_DISH = {
  name: '',
  description: '',
  price: 0,
  category: 'XoiMan' as DishCategory,
  imageUrl: '',
  isFeatured: false,
  sortOrder: 0,
};

/** Giá trị biểu mẫu từ món đang sửa (hoặc món trống khi thêm mới). */
function formValue(dish: DishDto | null): typeof EMPTY_DISH {
  if (!dish) return EMPTY_DISH;
  return {
    name: dish.name,
    description: dish.description ?? '',
    price: dish.price,
    category: dish.category,
    imageUrl: dish.imageUrl ?? '',
    isFeatured: dish.isFeatured,
    sortOrder: dish.sortOrder,
  };
}

@Component({
  selector: 'adm-dishes-page',
  imports: [ReactiveFormsModule, HlmButton],
  templateUrl: './dishes-page.html',
  styleUrl: './shop-admin.css',
})
export class DishesPage {
  private readonly service = inject(ShopAdminService);
  private readonly confirm = inject(ConfirmDialog);
  private readonly destroy = inject(DestroyRef);
  protected readonly categories = Object.entries(CATEGORY_LABELS) as [DishCategory, string][];
  protected readonly labels = CATEGORY_LABELS;
  protected readonly formatVnd = formatVnd;
  protected readonly dishes = signal<readonly DishDto[]>([]);
  protected readonly state = signal<'loading' | 'loaded' | 'error'>('loading');
  protected readonly editing = signal<DishDto | 'new' | null>(null);
  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly message = signal('');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: [''],
    description: [''],
    price: [0],
    category: [EMPTY_DISH.category],
    imageUrl: [''],
    isFeatured: [false],
    sortOrder: [0],
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    this.state.set('loading');
    this.service
      .dishes()
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (dishes) => {
          this.dishes.set(dishes);
          this.state.set('loaded');
        },
        error: () => {
          this.state.set('error');
        },
      });
  }

  protected open(dish: DishDto | null): void {
    this.formError.set(null);
    this.form.reset(formValue(dish));
    this.editing.set(dish ?? 'new');
    queueMicrotask(() => {
      this.panel()?.nativeElement.querySelector<HTMLInputElement>('input')?.focus();
    });
  }

  protected save(): void {
    const editing = this.editing();
    if (editing === null) return;
    const value = this.form.getRawValue();
    const input: DishInputRequest = {
      name: value.name.trim(),
      description: value.description.trim() || null,
      price: value.price,
      category: value.category,
      imageUrl: value.imageUrl.trim() || null,
      isFeatured: value.isFeatured,
      sortOrder: value.sortOrder,
    };
    this.saving.set(true);
    this.service
      .saveDish(editing === 'new' ? null : editing.id, input)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (saved) => {
          this.saving.set(false);
          this.editing.set(null);
          this.message.set(editing === 'new' ? `Đã thêm ${saved.name}.` : `Đã lưu ${saved.name}.`);
          this.load();
        },
        error: (error: unknown) => {
          this.saving.set(false);
          const first = Object.values(toApiError(error).errors ?? {})
            .at(0)
            ?.at(0);
          this.formError.set(first ?? 'Không lưu được món. Thử lại sau ít phút.');
        },
      });
  }

  protected toggleFeatured(dish: DishDto): void {
    this.service
      .saveDish(dish.id, { ...dish, isFeatured: !dish.isFeatured })
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (saved) => {
          this.dishes.update((list) => list.map((item) => (item.id === saved.id ? saved : item)));
          this.message.set(
            saved.isFeatured
              ? `Đã đưa ${saved.name} vào Quán giới thiệu.`
              : `Đã bỏ ${saved.name} khỏi Quán giới thiệu.`,
          );
        },
        error: () => {
          this.message.set(`Không đổi được ${dish.name}. Thử lại.`);
        },
      });
  }

  protected async remove(dish: DishDto): Promise<void> {
    const confirmed = await this.confirm.confirm({
      title: `Xóa món ${dish.name}?`,
      body: 'Món sẽ ẩn khỏi thực đơn ở mọi cơ sở. Các đơn đã đặt vẫn giữ tên và giá cũ.',
      confirmLabel: 'Xóa món',
      cancelLabel: 'Giữ món',
      danger: true,
    });
    if (!confirmed) return;
    this.service
      .deleteDish(dish.id)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          this.editing.set(null);
          this.message.set(`Đã xóa món ${dish.name}.`);
          this.load();
        },
        error: () => {
          this.message.set(`Không xóa được ${dish.name}. Thử lại.`);
        },
      });
  }

  protected close(): void {
    this.editing.set(null);
  }

  protected isEditing(dish: DishDto): boolean {
    const editing = this.editing();
    return editing !== null && editing !== 'new' && editing.id === dish.id;
  }
}
