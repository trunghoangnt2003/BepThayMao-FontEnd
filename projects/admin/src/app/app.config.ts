import { provideCore } from '@bepthaymao/core';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideCore(), provideBrowserGlobalErrorListeners(), provideRouter(routes)],
};
