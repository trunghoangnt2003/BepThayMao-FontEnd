import { provideCore } from '@bepthaymao/core';
import { SITE_URL } from './shared/seo/site-url';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: SITE_URL, useFactory: () => globalThis.location.origin },
    provideCore(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),
  ],
};
