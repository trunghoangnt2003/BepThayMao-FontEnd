import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MotionPreference } from '../../../shared/motion/motion-preference';
import { PageMeta } from '../../../shared/seo/page-meta';
import { CATEGORY_LABELS, CATEGORY_ORDER, HomeData, Loaded } from '../data-access/shop-data';
import { BannerStrip } from '../ui/banner-strip';
import { FoodCard } from '../ui/food-card';
import { CartBar } from '../ui/shop-ui';

/**
 * Màn Đặt món theo bản thử: banner ảnh lớn, ô nhóm món (bấm để cuộn tới nhóm), "Món được yêu thích"
 * rồi từng nhóm món dạng lưới thẻ. Tìm món nằm ở trang Thực đơn.
 */
@Component({
  selector: 'cus-home-page',
  imports: [RouterLink, BannerStrip, FoodCard, CartBar],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  readonly data = input.required<Loaded<HomeData>>();
  protected readonly status = signal('');
  private readonly document = inject(DOCUMENT);
  private readonly motion = inject(MotionPreference);

  protected readonly home = computed(() => {
    const data = this.data();
    return data.kind === 'loaded' ? data.value : null;
  });
  protected readonly featured = computed(
    () => this.home()?.menu.filter((dish) => dish.isFeatured) ?? [],
  );
  protected readonly banners = computed(() => this.home()?.content.banners ?? []);
  /** Mọi nhóm món theo thứ tự cố định; ảnh ô nhóm là ảnh món đầu tiên trong nhóm có ảnh. */
  protected readonly groups = computed(() => {
    const menu = this.home()?.menu ?? [];
    return CATEGORY_ORDER.map((value) => {
      const dishes = menu.filter((dish) => dish.category === value);
      return {
        value,
        label: CATEGORY_LABELS[value],
        lower: CATEGORY_LABELS[value].toLocaleLowerCase('vi'),
        dishes,
        imageUrl: dishes.find((dish) => dish.imageUrl)?.imageUrl ?? null,
      };
    });
  });

  constructor() {
    inject(PageMeta).set({
      title: 'Đặt món',
      description:
        'Chọn món xôi, chọn cơ sở gần bạn, quét mã QR để thanh toán. Phí ship trả riêng khi nhận hàng.',
      path: '/dat-mon',
    });
  }

  /** Nút "Đặt món ngay" của banner không gắn món: tới món được yêu thích, không có thì tới nhóm đầu. */
  protected browse(): void {
    this.scrollTo(this.featured().length > 0 ? 'mon-yeu-thich' : `g-${CATEGORY_ORDER[0]}`);
  }

  protected scrollTo(id: string): void {
    this.document.getElementById(id)?.scrollIntoView({
      behavior: this.motion.enabled() ? 'smooth' : 'auto',
      block: 'start',
    });
  }

  protected announce(name: string): void {
    this.status.set(`Đã thêm ${name} vào giỏ`);
  }
}
