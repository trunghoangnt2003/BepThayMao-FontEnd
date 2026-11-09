import { Component, inject } from '@angular/core';
import { HlmButton } from '@bepthaymao/ui';
import { PageMeta } from '../../shared/seo/page-meta';

@Component({
  selector: 'cus-not-found-page',
  imports: [HlmButton],
  template: `<h1 tabindex="-1">Không tìm thấy trang</h1>
    <p>Đường dẫn có thể đã sai hoặc trang đã được chuyển.</p>
    <a hlmBtn href="/co-so">Về danh sách cơ sở</a>`,
  styles: ':host { display: grid; gap: var(--space-lg); justify-items: start; }',
})
export class NotFoundPage {
  readonly heading = 'Không tìm thấy trang';
  constructor() {
    inject(PageMeta).set({
      title: 'Không tìm thấy trang',
      description: 'Đường dẫn có thể đã sai hoặc trang đã được chuyển.',
      path: '/khong-co',
      robots: 'noindex,nofollow',
    });
  }
}
