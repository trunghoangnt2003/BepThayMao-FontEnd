import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PageMeta } from '../../shared/seo/page-meta';

@Component({
  selector: 'cus-not-found-page',
  templateUrl: './not-found-page.html',
  styleUrl: './not-found-page.css',
})
export class NotFoundPage {
  protected readonly title = 'Không tìm thấy trang';

  constructor() {
    inject(PageMeta).set({
      title: this.title,
      description: 'Đường dẫn có thể đã sai hoặc trang đã được chuyển.',
      path: inject(Router).url,
      robots: 'noindex',
    });
  }
}
