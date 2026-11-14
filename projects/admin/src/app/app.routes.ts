import { Routes } from '@angular/router';
import { unsavedChangesGuard } from './features/branches/pages/branch-edit/unsaved-changes.guard';
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
        path: 'overview',
        title: 'Tổng quan',
        loadComponent: () =>
          import('./features/overview/pages/overview-page').then((m) => m.OverviewPage),
      },
      {
        path: 'branches/new',
        title: 'Tạo cơ sở mới',
        loadComponent: () =>
          import('./features/branches/pages/branch-create/branch-create-page').then(
            (m) => m.BranchCreatePage,
          ),
      },
      {
        path: 'branches/:id',
        title: 'Sửa cơ sở',
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () =>
          import('./features/branches/pages/branch-edit/branch-edit-page').then(
            (m) => m.BranchEditPage,
          ),
      },
      {
        path: 'orders',
        title: 'Đơn hàng',
        loadComponent: () =>
          import('./features/shop-admin/pages/orders-page').then((m) => m.OrdersPage),
      },
      {
        path: 'stock',
        title: 'Còn món',
        loadComponent: () =>
          import('./features/shop-admin/pages/stock-page').then((m) => m.StockPage),
      },
      {
        path: 'dishes',
        title: 'Thực đơn',
        loadComponent: () =>
          import('./features/shop-admin/pages/dishes-page').then((m) => m.DishesPage),
      },
      {
        path: 'content',
        title: 'Giới thiệu quán',
        loadComponent: () =>
          import('./features/shop-admin/pages/content-page').then((m) => m.ContentPage),
      },
      {
        path: 'legal',
        title: 'Pháp lý và chính sách',
        loadComponent: () =>
          import('./features/shop-admin/pages/legal-page').then((m) => m.LegalPage),
      },
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
    children: [
      {
        path: 'overview',
        title: 'Tổng quan',
        loadComponent: () =>
          import('./features/overview/pages/overview-page').then((m) => m.OverviewPage),
      },
      {
        path: 'orders',
        title: 'Đơn hàng',
        loadComponent: () =>
          import('./features/shop-admin/pages/orders-page').then((m) => m.OrdersPage),
      },
      {
        path: 'stock',
        title: 'Còn món',
        loadComponent: () =>
          import('./features/shop-admin/pages/stock-page').then((m) => m.StockPage),
      },
      {
        path: 'settings',
        title: 'Thông số cơ sở',
        loadComponent: () =>
          import('./features/manager-settings/pages/manager-settings-page').then(
            (m) => m.ManagerSettingsPage,
          ),
      },
    ],
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
