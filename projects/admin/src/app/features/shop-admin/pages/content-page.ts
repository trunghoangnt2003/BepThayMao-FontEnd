import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BannerDto, BannerInputRequest } from '@bepthaymao/api-client';
import { toApiError } from '@bepthaymao/core';
import { HlmButton } from '@bepthaymao/ui';
import { ConfirmDialog } from '../../../shared/dialog/confirm-dialog';
import { ShopAdminService } from '../data-access/shop-admin.service';

function toInput(banner: BannerDto, changes: Partial<BannerInputRequest> = {}): BannerInputRequest {
  return {
    title: banner.title,
    body: banner.body ?? null,
    imageUrl: banner.imageUrl ?? null,
    linkDishId: banner.linkDishId ?? null,
    sortOrder: banner.sortOrder,
    isActive: banner.isActive,
    ...changes,
  };
}

@Component({
  selector: 'adm-content-page',
  imports: [ReactiveFormsModule, HlmButton],
  templateUrl: './content-page.html',
  styleUrl: './shop-admin.css',
})
export class ContentPage {
  private readonly service = inject(ShopAdminService);
  private readonly confirm = inject(ConfirmDialog);
  private readonly destroy = inject(DestroyRef);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly banners = signal<readonly BannerDto[]>([]);
  protected readonly state = signal<'loading' | 'loaded' | 'error'>('loading');
  protected readonly editing = signal<BannerDto | 'new' | null>(null);
  protected readonly message = signal('');
  protected readonly formError = signal<string | null>(null);
  protected readonly bannerForm = this.fb.group({ title: [''], body: [''], isActive: [true] });
  protected readonly aboutForm = this.fb.group({ about: [''] });

  constructor() {
    this.load();
    this.service
      .content()
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (content) => {
          this.aboutForm.reset({ about: content.about ?? '' });
        },
      });
  }

  protected load(): void {
    this.state.set('loading');
    this.service
      .banners()
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (banners) => {
          this.banners.set(banners);
          this.state.set('loaded');
        },
        error: () => {
          this.state.set('error');
        },
      });
  }

  protected open(banner: BannerDto | null): void {
    this.formError.set(null);
    this.bannerForm.reset({
      title: banner?.title ?? '',
      body: banner?.body ?? '',
      isActive: banner?.isActive ?? true,
    });
    this.editing.set(banner ?? 'new');
  }

  protected close(): void {
    this.editing.set(null);
  }

  protected saveBanner(): void {
    const editing = this.editing();
    if (editing === null) return;
    const value = this.bannerForm.getRawValue();
    const base: BannerInputRequest =
      editing === 'new'
        ? {
            title: '',
            body: null,
            imageUrl: null,
            linkDishId: null,
            sortOrder: this.banners().length,
            isActive: true,
          }
        : toInput(editing);
    const input = {
      ...base,
      title: value.title.trim(),
      body: value.body.trim() || null,
      isActive: value.isActive,
    };
    this.service
      .saveBanner(editing === 'new' ? null : editing.id, input)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (saved) => {
          this.editing.set(null);
          this.message.set(`Đã lưu banner ${saved.title}.`);
          this.load();
        },
        error: (error: unknown) => {
          const first = Object.values(toApiError(error).errors ?? {})
            .at(0)
            ?.at(0);
          this.formError.set(first ?? 'Không lưu được banner. Thử lại sau ít phút.');
        },
      });
  }

  protected toggle(banner: BannerDto): void {
    this.update(
      banner,
      { isActive: !banner.isActive },
      banner.isActive ? 'Đã ẩn banner.' : 'Đã hiện banner.',
    );
  }

  /** Đổi chỗ với banner kề trên/dưới bằng cách hoán đổi sortOrder (bàn phím dùng được, không kéo thả). */
  protected move(index: number, step: -1 | 1): void {
    const list = this.banners();
    const current = list.at(index);
    const other = list.at(index + step);
    if (!current || !other || index + step < 0) return;
    this.update(current, { sortOrder: other.sortOrder }, '');
    this.update(other, { sortOrder: current.sortOrder }, `Đã đổi thứ tự ${current.title}.`);
  }

  private update(banner: BannerDto, changes: Partial<BannerInputRequest>, done: string): void {
    this.service
      .saveBanner(banner.id, toInput(banner, changes))
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          if (done) this.message.set(done);
          this.load();
        },
        error: () => {
          this.message.set('Không lưu được banner. Thử lại.');
        },
      });
  }

  protected async remove(banner: BannerDto): Promise<void> {
    const confirmed = await this.confirm.confirm({
      title: `Xóa banner ${banner.title}?`,
      body: 'Banner sẽ không còn hiện ở trang chủ khách.',
      confirmLabel: 'Xóa banner',
      cancelLabel: 'Giữ banner',
      danger: true,
    });
    if (!confirmed) return;
    this.service
      .deleteBanner(banner.id)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          this.message.set(`Đã xóa banner ${banner.title}.`);
          this.load();
        },
        error: () => {
          this.message.set('Không xóa được banner. Thử lại.');
        },
      });
  }

  protected saveAbout(): void {
    this.service
      .saveAbout(this.aboutForm.getRawValue().about)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          this.message.set('Đã lưu đoạn giới thiệu.');
        },
        error: () => {
          this.message.set('Không lưu được đoạn giới thiệu. Tối đa 300 ký tự.');
        },
      });
  }
}
