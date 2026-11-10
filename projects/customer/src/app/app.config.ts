import { API_BASE_URL, provideCore } from '@bepthaymao/core';
import { SITE_URL } from './shared/seo/site-url';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: SITE_URL, useFactory: () => globalThis.location.origin },
    provideCore(),
    // Absolute browser URLs so the SSR transfer cache key matches (see HTTP_TRANSFER_CACHE_ORIGIN_MAP, P31).
    { provide: API_BASE_URL, useFactory: () => globalThis.location.origin },
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(),
  ],
};
