import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButton } from '@bepthaymao/ui';

@Component({
  selector: 'adm-not-found-page',
  imports: [RouterLink, HlmButton],
  template: `<h1 tabindex="-1">Không tìm thấy trang</h1>
    <p>Đường dẫn có thể đã sai hoặc trang đã được chuyển.</p>
    <a hlmBtn routerLink="/branches">Về trang của tôi</a>`,
  styles: ':host { display: grid; gap: var(--space-lg); justify-items: start; }',
})
export class NotFoundPage {
  readonly heading = 'Không tìm thấy trang';
}
