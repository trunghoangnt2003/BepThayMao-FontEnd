export { API_BASE_URL } from './lib/api/api-base-url';
export { baseUrlInterceptor } from './lib/api/base-url.interceptor';
export { problemInterceptor } from './lib/errors/problem.interceptor';
export { isApiError, toApiError } from './lib/errors/api-error';
export type { ApiError } from './lib/errors/api-error';
export { provideCore } from './lib/provide-core';
