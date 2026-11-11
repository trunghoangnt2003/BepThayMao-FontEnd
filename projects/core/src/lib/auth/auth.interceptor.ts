import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { API_BASE_URL } from '../api/api-base-url';
import { toApiError } from '../errors/api-error';
import { AccessTokenStore } from './access-token-store';
import { TOKEN_REFRESHER } from './token-refresher';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const base = inject(API_BASE_URL).replace(/\/$/, '');
  const path = request.url.startsWith('/api/')
    ? request.url
    : base && request.url.startsWith(base + '/api/')
      ? request.url.slice(base.length)
      : null;
  if (!path || path.startsWith('/api/v1/auth/')) return next(request);
  const store = inject(AccessTokenStore);
  const refresher = inject(TOKEN_REFRESHER, { optional: true });
  const token = store.accessToken();
  const authenticated = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;
  return next(authenticated).pipe(
    catchError((error: unknown) => {
      if (!refresher || toApiError(error).status !== 401) return throwError(() => error);
      return refresher.refreshOnce().pipe(
        catchError(() => throwError(() => error)),
        switchMap((fresh) =>
          next(request.clone({ setHeaders: { Authorization: `Bearer ${fresh}` } })),
        ),
      );
    }),
  );
};
