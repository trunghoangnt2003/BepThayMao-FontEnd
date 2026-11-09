import { Routes } from '@angular/router';
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'branches' },
  {
    path: 'branches',
    title: 'Danh sách cơ sở',
    loadComponent: () =>
      import('./features/branches/pages/branch-list/branch-list-page').then(
        (m) => m.BranchListPage,
      ),
  },
  {
    path: '**',
    title: 'Không tìm thấy trang',
    loadComponent: () => import('./pages/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];
