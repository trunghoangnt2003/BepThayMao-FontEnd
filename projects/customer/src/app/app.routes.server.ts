import { RenderMode, ServerRoute } from '@angular/ssr';
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Server },
  { path: 'co-so', renderMode: RenderMode.Server },
  { path: 'thuc-don', renderMode: RenderMode.Server },
  { path: 'mon/:dishId', renderMode: RenderMode.Server },
  { path: 'dat-hang', renderMode: RenderMode.Server },
  { path: 'don/:code', renderMode: RenderMode.Server },
  { path: 'tra-don', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Server, status: 404 },
];
