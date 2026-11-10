import { Component, inject, input } from '@angular/core';
import { formatOpeningHours } from '@bepthaymao/ui';
import { PageMeta } from '../../../../shared/seo/page-meta';
import type { PublicBranchList } from '../../data-access/public-branches.service';
import { toTelHref } from '../../ui/tel-href';

@Component({
  selector: 'cus-branch-list-page',
  templateUrl: './branch-list-page.html',
  styleUrl: './branch-list-page.css',
})
export class BranchListPage {
  readonly branches = input.required<PublicBranchList>();

  protected readonly toTelHref = toTelHref;
  protected readonly formatOpeningHours = formatOpeningHours;

  constructor() {
    inject(PageMeta).set({
      title: 'Các cơ sở',
      description: 'Danh sách cơ sở của Bếp Thầy Mão: địa chỉ, số điện thoại và giờ nhận đơn.',
      path: '/co-so',
    });
  }
}
