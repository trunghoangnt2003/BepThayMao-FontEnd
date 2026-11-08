import { provideCore } from '@bepthaymao/core';
import { SITE_URL } from './shared/seo/site-url';
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    { provide: SITE_URL, useValue: process.env['SITE_URL'] ?? 'http://localhost:8080' },
    provideCore({ apiBaseUrl: process.env['API_INTERNAL_URL'] ?? 'http://127.0.0.1:5080' }),
    provideServerRendering(withRoutes(serverRoutes)),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
