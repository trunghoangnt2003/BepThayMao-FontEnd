import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '**',
    title: 'Không tìm thấy trang',
    loadComponent: () =>
      import('./pages/not-found/not-found-page').then((module) => module.NotFoundPage),
  },
];
