import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MotionPreference } from '../../../shared/motion/motion-preference';
import { PageMeta } from '../../../shared/seo/page-meta';
import { PublicBranchList } from '../../branches/data-access/public-branches.service';
import { HomeData, Loaded } from '../../shop/data-access/shop-data';
import { LandingBranches } from '../ui/landing-branches';
import { LandingFeatured } from '../ui/landing-featured';
import { LandingHero } from '../ui/landing-hero';
import { LandingStory } from '../ui/landing-story';
import { LandingVelo } from '../ui/landing-velo';
import { startLandingMotion } from './landing-motion';

/**
 * Trang giới thiệu theo bản thử "Biển Hiệu Phố": cuộn kể chuyện, mọi nút Đặt món ngay vào /dat-mon.
 * Chỉ dùng dữ liệu thật; hiệu ứng GSAP chỉ nạp ở trình duyệt khi MotionPreference bật.
 */
@Component({
  selector: 'cus-landing-page',
  imports: [RouterLink, LandingFeatured, LandingHero, LandingStory, LandingBranches, LandingVelo],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  readonly data = input.required<Loaded<HomeData>>();
  readonly branches = input.required<PublicBranchList>();
  // TODO(license): ảnh tạm có watermark AdobeStock, MUST thay bằng ảnh có giấy phép trước khi lên production (quick 261116-nif, D-02).
  protected readonly heroImage = '/images/landing/xoi-ga-hero.jpg';
  // TODO(license): ảnh suất xôi gà lấy từ bản thử, MUST xác nhận quyền dùng trước khi lên production.
  protected readonly storyImage = '/images/landing/xoi-ga-lop.jpg';

  protected readonly home = computed(() => {
    const data = this.data();
    return data.kind === 'loaded' ? data.value : null;
  });
  protected readonly menu = computed(() => this.home()?.menu ?? []);
  protected readonly featured = computed(() => this.menu().filter((dish) => dish.isFeatured));
  /** Món xôi gà thật trong thực đơn (nếu có) để thẻ cuối của phần lắp lớp thêm đúng món vào giỏ. */
  protected readonly storyDish = computed(
    () => this.menu().find((dish) => dish.name.toLocaleLowerCase('vi').includes('gà')) ?? null,
  );
  protected readonly about = computed(() => this.home()?.content.about?.trim() ?? '');
  protected readonly branchList = computed(() => {
    const list = this.branches();
    return list.kind === 'loaded' ? list.branches : [];
  });

  private readonly motion = inject(MotionPreference);
  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');

  constructor() {
    inject(PageMeta).set({
      title: 'Xôi nóng giao tận nơi',
      description:
        'Bếp Thầy Mão: thực đơn xôi chung cho mọi cơ sở, chọn cơ sở gần bạn, quét mã QR để thanh toán.',
      path: '/',
    });
    afterRenderEffect((onCleanup) => {
      if (!this.motion.enabled()) return;
      const element = this.root().nativeElement;
      let stop: (() => void) | null = null;
      let cancelled = false;
      void startLandingMotion(element).then((cleanup) => {
        if (cancelled) cleanup();
        else stop = cleanup;
      });
      onCleanup(() => {
        cancelled = true;
        stop?.();
      });
    });
  }
}
