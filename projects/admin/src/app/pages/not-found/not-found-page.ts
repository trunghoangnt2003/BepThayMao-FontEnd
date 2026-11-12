import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButton } from '@bepthaymao/ui';
import { AuthSessionService } from '../../features/auth/data-access/auth-session.service';

@Component({
  selector: 'adm-not-found-page',
  imports: [RouterLink, HlmButton],
  template: `<h1 tabindex="-1">Không tìm thấy trang</h1>
    <p>Đường dẫn có thể đã sai hoặc trang đã được chuyển.</p>
    <a hlmBtn [routerLink]="auth.roleHome()">Về trang của tôi</a>`,
  styles: ':host { display: grid; gap: var(--space-lg); justify-items: start; }',
})
export class NotFoundPage {
  protected readonly auth = inject(AuthSessionService);
  readonly heading = 'Không tìm thấy trang';
}
