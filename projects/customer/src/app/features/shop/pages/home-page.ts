import { Component, computed, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageMeta } from '../../../shared/seo/page-meta';
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  formatVnd,
  HomeData,
  Loaded,
} from '../data-access/shop-data';
import { CartBar, DishRow, DishThumb, QtyStepper } from '../ui/shop-ui';

@Component({
  selector: 'cus-home-page',
  imports: [RouterLink, DishRow, DishThumb, QtyStepper, CartBar],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  readonly data = input.required<Loaded<HomeData>>();
  protected readonly categories = CATEGORY_ORDER.map((value) => ({
    value,
    label: CATEGORY_LABELS[value],
  }));
  protected readonly formatVnd = formatVnd;
  protected readonly slide = signal(0);
  private readonly track = viewChild<ElementRef<HTMLElement>>('track');

  protected readonly home = computed(() => {
    const data = this.data();
    return data.kind === 'loaded' ? data.value : null;
  });
  protected readonly featured = computed(
    () => this.home()?.menu.filter((dish) => dish.isFeatured) ?? [],
  );
  protected readonly banners = computed(() => this.home()?.content.banners ?? []);

  constructor() {
    inject(PageMeta).set({
      title: 'Đặt xôi online',
      description:
        'Chọn món xôi, chọn cơ sở gần bạn, quét mã QR để thanh toán. Phí ship trả riêng khi nhận hàng.',
      path: '/',
    });
  }

  protected go(step: number): void {
    const element = this.track()?.nativeElement;
    const count = this.banners().length;
    if (!element || count === 0) return;
    const next = (this.slide() + step + count) % count;
    this.slide.set(next);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    element.scrollTo({ left: next * element.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
  }

  protected onScroll(element: HTMLElement): void {
    if (element.clientWidth > 0)
      this.slide.set(Math.round(element.scrollLeft / element.clientWidth));
  }
}
