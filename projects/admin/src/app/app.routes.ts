import { Routes } from '@angular/router';
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'owner/branches' },
  {
    path: 'login',
    title: 'Đăng nhập',
    loadComponent: () => import('./features/auth/pages/login/login-page').then((m) => m.LoginPage),
  },
  { path: 'branches', pathMatch: 'full', redirectTo: 'owner/branches' },
  {
    path: 'owner/branches',
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
