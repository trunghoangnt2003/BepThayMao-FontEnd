import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { withComponentInputBinding } from '@angular/router';
import { API_BASE_URL } from '@bepthaymao/core';
import { provideCore } from '@bepthaymao/core';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCore(),
    { provide: API_BASE_URL, useFactory: () => inject(DOCUMENT).location.origin },
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(),
  ],
};
