import { provideCore, TOKEN_REFRESHER } from '@bepthaymao/core';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthSessionService } from './features/auth/data-access/auth-session.service';
import { provideRouter } from '@angular/router';
import { TitleStrategy } from '@angular/router';
import { AdminTitleStrategy } from './shared/title/admin-title-strategy';
import { provideRouteFocus } from './shared/a11y/route-focus';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCore(),
    { provide: TOKEN_REFRESHER, useExisting: AuthSessionService },
    provideAppInitializer(() => firstValueFrom(inject(AuthSessionService).restore())),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideRouteFocus(),
    { provide: TitleStrategy, useClass: AdminTitleStrategy },
  ],
};
