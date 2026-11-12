import { Component, inject, input } from '@angular/core';
import { formatOpeningHours } from '@bepthaymao/ui';
import { PublicBranchList } from '../../data-access/public-branches.service';
import { toTelHref } from '../../ui/tel-href';
import { PageMeta } from '../../../../shared/seo/page-meta';

@Component({
  selector: 'cus-branch-list-page',
  templateUrl: './branch-list-page.html',
  styleUrl: './branch-list-page.css',
})
export class BranchListPage {
  readonly branches = input.required<PublicBranchList>();
  readonly formatOpeningHours = formatOpeningHours;
  readonly toTelHref = toTelHref;
  constructor() {
    inject(PageMeta).set({
      title: 'Các cơ sở',
      description: 'Danh sách cơ sở của Bếp Thầy Mão: địa chỉ, số điện thoại và giờ nhận đơn.',
      path: '/co-so',
    });
  }
}
