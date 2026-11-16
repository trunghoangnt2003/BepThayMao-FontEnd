import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageMeta } from '../../../shared/seo/page-meta';
import { PublicBranchList } from '../../branches/data-access/public-branches.service';
import { HomeData, Loaded } from '../../shop/data-access/shop-data';
import { LandingBranches } from '../ui/landing-branches';
import { LandingFeatured } from '../ui/landing-featured';
import { LandingHero } from '../ui/landing-hero';
import { LandingMenu } from '../ui/landing-menu';
import { LandingSteps } from '../ui/landing-steps';
import { LandingVelo } from '../ui/landing-velo';
import { LandingStory } from '../ui/landing-story';

/** Trang giới thiệu: cuộn kể về quán, mọi nút Đặt món ngay dẫn vào trang đặt món. Chỉ dùng dữ liệu thật. */
@Component({
  selector: 'cus-landing-page',
  imports: [
    RouterLink,
    LandingFeatured,
    LandingHero,
    LandingStory,
    LandingMenu,
    LandingBranches,
    LandingSteps,
    LandingVelo,
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  readonly data = input.required<Loaded<HomeData>>();
  readonly branches = input.required<PublicBranchList>();
  // TODO(license): ảnh tạm có watermark AdobeStock, MUST thay bằng ảnh có giấy phép trước khi lên production (quick 261116-nif, D-02).
  protected readonly heroImage = '/images/landing/xoi-ga-hero.jpg';

  protected readonly home = computed(() => {
    const data = this.data();
    return data.kind === 'loaded' ? data.value : null;
  });
  protected readonly menu = computed(() => this.home()?.menu ?? []);
  protected readonly featured = computed(() => this.menu().filter((dish) => dish.isFeatured));
  /** Món xôi xéo thật trong thực đơn (nếu có) để thẻ cuối của story dẫn tới đúng món. */
  protected readonly storyDish = computed(
    () => this.menu().find((dish) => dish.name.toLocaleLowerCase('vi').includes('xéo')) ?? null,
  );
  protected readonly about = computed(() => this.home()?.content.about?.trim() ?? '');
  protected readonly branchList = computed(() => {
    const list = this.branches();
    return list.kind === 'loaded' ? list.branches : [];
  });

  constructor() {
    inject(PageMeta).set({
      title: 'Xôi nóng giao tận nơi',
      description:
        'Bếp Thầy Mão: thực đơn xôi chung cho mọi cơ sở, chọn cơ sở gần bạn, quét mã QR để thanh toán.',
      path: '/',
    });
  }
}
