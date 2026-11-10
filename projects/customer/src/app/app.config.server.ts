import { HTTP_TRANSFER_CACHE_ORIGIN_MAP } from '@angular/common/http';
import { provideCore } from '@bepthaymao/core';
import { SITE_URL } from './shared/seo/site-url';
import { mergeApplicationConfig, ApplicationConfig, inject, REQUEST } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const apiInternalUrl = process.env['API_INTERNAL_URL'] ?? 'http://127.0.0.1:5080';

const serverConfig: ApplicationConfig = {
  providers: [
    { provide: SITE_URL, useValue: process.env['SITE_URL'] ?? 'http://localhost:8080' },
    provideCore({ apiBaseUrl: apiInternalUrl }),
    // The server calls the API on its internal origin, the browser on the public one; map them so
    // hydration reuses the SSR response instead of refetching (P31). shortcut: the request origin
    // comes from the Host header, so behind TLS termination configure trusted proxy headers first.
    {
      provide: HTTP_TRANSFER_CACHE_ORIGIN_MAP,
      useFactory: () => {
        const request = inject(REQUEST, { optional: true });
        const publicOrigin = new URL(request?.url ?? inject(SITE_URL)).origin;
        return { [new URL(apiInternalUrl).origin]: publicOrigin };
      },
    },
    provideServerRendering(withRoutes(serverRoutes)),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
