import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DishCategory } from '@bepthaymao/api-client';
import { BtmSpotlight } from '@bepthaymao/ui';
import { PageMeta } from '../../../shared/seo/page-meta';
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  formatVnd,
  HomeData,
  Loaded,
  matchesQuery,
} from '../data-access/shop-data';
import { BannerStrip } from '../ui/banner-strip';
import { CartBar, DishRow, DishThumb, QtyStepper } from '../ui/shop-ui';

type Filter = DishCategory | 'all';

@Component({
  selector: 'cus-home-page',
  imports: [RouterLink, BtmSpotlight, BannerStrip, DishRow, DishThumb, QtyStepper, CartBar],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  readonly data = input.required<Loaded<HomeData>>();
  protected readonly chips: readonly { value: Filter; label: string }[] = [
    { value: 'all', label: 'Tất cả' },
    ...CATEGORY_ORDER.map((value) => ({ value, label: CATEGORY_LABELS[value] })),
  ];
  protected readonly formatVnd = formatVnd;
  protected readonly query = signal('');
  protected readonly category = signal<Filter>('all');

  protected readonly home = computed(() => {
    const data = this.data();
    return data.kind === 'loaded' ? data.value : null;
  });
  /** Đang xem toàn bộ (chưa tìm, chưa lọc) thì hiện banner và món giới thiệu. */
  protected readonly browsing = computed(
    () => this.query().trim() === '' && this.category() === 'all',
  );
  protected readonly featured = computed(
    () => this.home()?.menu.filter((dish) => dish.isFeatured) ?? [],
  );
  protected readonly banners = computed(() => this.home()?.content.banners ?? []);
  protected readonly groups = computed(() => {
    const menu = (this.home()?.menu ?? []).filter((dish) => matchesQuery(dish.name, this.query()));
    return CATEGORY_ORDER.filter((value) => this.category() === 'all' || this.category() === value)
      .map((value) => ({
        value,
        label: CATEGORY_LABELS[value],
        dishes: menu.filter((dish) => dish.category === value),
      }))
      .filter((group) => group.dishes.length > 0);
  });

  constructor() {
    inject(PageMeta).set({
      title: 'Đặt món',
      description:
        'Chọn món xôi, chọn cơ sở gần bạn, quét mã QR để thanh toán. Phí ship trả riêng khi nhận hàng.',
      path: '/dat-mon',
    });
  }
}
