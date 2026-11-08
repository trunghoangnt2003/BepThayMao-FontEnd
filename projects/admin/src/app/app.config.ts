import { provideCore } from '@bepthaymao/core';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, TitleStrategy } from '@angular/router';
import { AdminTitleStrategy } from './shared/title/admin-title-strategy';
import { provideRouteFocus } from './shared/a11y/route-focus';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCore(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: TitleStrategy, useClass: AdminTitleStrategy },
    provideRouteFocus(),
  ],
};
