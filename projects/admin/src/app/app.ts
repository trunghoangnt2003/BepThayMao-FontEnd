import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { AccessTokenStore } from '@bepthaymao/core';
import { HlmButton } from '@bepthaymao/ui';
import { AuthSessionService } from './features/auth/data-access/auth-session.service';
import { IconComponent } from './shared/icon/icon';
@Component({
  selector: 'adm-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, HlmButton, IconComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly store = inject(AccessTokenStore);
  private readonly auth = inject(AuthSessionService);
  private readonly router = inject(Router);
  readonly lang = 'vi';

  logout(): void {
    this.auth.logout().subscribe(() => {
      void this.router.navigateByUrl('/login');
    });
  }
}
