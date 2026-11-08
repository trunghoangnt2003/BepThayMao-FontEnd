import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_BASE_URL } from './api-base-url';

export const baseUrlInterceptor: HttpInterceptorFn = (request, next) => {
  const baseUrl = inject(API_BASE_URL);
  return next(
    baseUrl && request.url.startsWith('/api/')
      ? request.clone({ url: baseUrl.replace(/\/$/, '') + request.url })
      : request,
  );
};
