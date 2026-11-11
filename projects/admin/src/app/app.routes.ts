import { Routes } from '@angular/router';
import { authGuard, homeGuard, loginGuard, roleGuard } from './shared/auth/auth.guards';
export const routes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [homeGuard], children: [] },
  {
    path: 'login',
    canActivate: [loginGuard],
    title: 'Đăng nhập',
    loadComponent: () => import('./features/auth/pages/login/login-page').then((m) => m.LoginPage),
  },
  { path: 'branches', pathMatch: 'full', redirectTo: 'owner/branches' },
  {
    path: 'owner',
    canActivate: [authGuard, roleGuard('Owner')],
    children: [
      {
        path: 'branches',
        title: 'Danh sách cơ sở',
        loadComponent: () =>
          import('./features/branches/pages/branch-list/branch-list-page').then(
            (m) => m.BranchListPage,
          ),
      },
    ],
  },
  {
    path: 'manager',
    canActivate: [authGuard, roleGuard('BranchManager')],
    children: [],
  },
  {
    path: 'forbidden',
    title: 'Không có quyền',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/forbidden/forbidden-page').then((m) => m.ForbiddenPage),
  },
  {
    path: '**',
    title: 'Không tìm thấy trang',
    loadComponent: () => import('./pages/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];
