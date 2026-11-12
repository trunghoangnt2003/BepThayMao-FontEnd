import { HTTP_TRANSFER_CACHE_ORIGIN_MAP } from '@angular/common/http';
import { inject, REQUEST } from '@angular/core';
import { provideCore } from '@bepthaymao/core';
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { SITE_URL } from './shared/seo/page-meta';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    {
      provide: HTTP_TRANSFER_CACHE_ORIGIN_MAP,
      useFactory: () => ({
        [new URL(process.env['API_INTERNAL_URL'] ?? 'http://127.0.0.1:5080').origin]: new URL(
          inject(REQUEST)?.url ?? 'http://localhost:8080',
        ).origin,
      }),
    },
    { provide: SITE_URL, useValue: process.env['SITE_URL'] ?? 'http://localhost:8080' },
    provideCore({ apiBaseUrl: process.env['API_INTERNAL_URL'] ?? 'http://127.0.0.1:5080' }),
    provideServerRendering(withRoutes(serverRoutes)),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
