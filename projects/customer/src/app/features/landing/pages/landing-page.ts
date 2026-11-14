import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageMeta } from '../../../shared/seo/page-meta';
import { PublicBranchList } from '../../branches/data-access/public-branches.service';
import { formatVnd, HomeData, Loaded } from '../../shop/data-access/shop-data';
import { DishThumb } from '../../shop/ui/shop-ui';
import { LandingBranches } from '../ui/landing-branches';
import { LandingMenu } from '../ui/landing-menu';
import { LandingSteps } from '../ui/landing-steps';

/** Trang giới thiệu: cuộn kể về quán, mọi nút Đặt ngay dẫn vào trang đặt món. Chỉ dùng dữ liệu thật. */
@Component({
  selector: 'cus-landing-page',
  imports: [RouterLink, DishThumb, LandingMenu, LandingBranches, LandingSteps],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  readonly data = input.required<Loaded<HomeData>>();
  readonly branches = input.required<PublicBranchList>();
  protected readonly formatVnd = formatVnd;

  protected readonly home = computed(() => {
    const data = this.data();
    return data.kind === 'loaded' ? data.value : null;
  });
  protected readonly menu = computed(() => this.home()?.menu ?? []);
  protected readonly featured = computed(() => this.menu().filter((dish) => dish.isFeatured));
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
