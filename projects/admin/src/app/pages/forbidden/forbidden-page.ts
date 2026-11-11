import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButton } from '@bepthaymao/ui';
import { AuthSessionService } from '../../features/auth/data-access/auth-session.service';

@Component({
  selector: 'adm-forbidden-page',
  imports: [RouterLink, HlmButton],
  template: `<h1 tabindex="-1">Bạn không có quyền vào trang này</h1>
    <p>Tài khoản của bạn không được xem trang này.</p>
    <a hlmBtn [routerLink]="auth.roleHome()">Về trang của tôi</a>`,
  styles: ':host { display: grid; gap: var(--space-lg); justify-items: start; }',
})
export class ForbiddenPage {
  protected readonly auth = inject(AuthSessionService);
}
