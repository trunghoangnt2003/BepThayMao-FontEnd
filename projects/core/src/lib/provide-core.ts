import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { API_BASE_URL } from './api/api-base-url';
import { baseUrlInterceptor } from './api/base-url.interceptor';
import { problemInterceptor } from './errors/problem.interceptor';

export function provideCore(options?: { apiBaseUrl?: string }): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideHttpClient(withInterceptors([baseUrlInterceptor, problemInterceptor])),
    { provide: API_BASE_URL, useValue: options?.apiBaseUrl ?? '' },
  ]);
}
