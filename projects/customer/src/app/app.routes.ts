import { Routes } from '@angular/router';
import { policyResolver } from './features/legal/data-access/legal.service';
import { publicBranchesResolver } from './features/branches/data-access/public-branches.resolver';
import { dishResolver, homeResolver, menuResolver } from './features/shop/data-access/shop-data';

// / là trang giới thiệu; đặt món ở /dat-mon, chọn cơ sở ở /dat-hang (D-13). Mọi route SSR, có <title> riêng qua PageMeta.
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    resolve: { data: homeResolver, branches: publicBranchesResolver },
    loadComponent: () => import('./features/landing/pages/landing-page').then((m) => m.LandingPage),
  },
  {
    path: 'dat-mon',
    resolve: { data: homeResolver },
    loadComponent: () => import('./features/shop/pages/home-page').then((m) => m.HomePage),
  },
  {
    path: 'thuc-don',
    resolve: { menu: menuResolver },
    loadComponent: () => import('./features/shop/pages/menu-page').then((m) => m.MenuPage),
  },
  {
    path: 'mon/:dishId',
    resolve: { dish: dishResolver },
    loadComponent: () => import('./features/shop/pages/dish-page').then((m) => m.DishPage),
  },
  {
    path: 'dat-hang',
    loadComponent: () => import('./features/shop/pages/checkout-page').then((m) => m.CheckoutPage),
  },
  {
    path: 'don/:code',
    loadComponent: () => import('./features/shop/pages/order-page').then((m) => m.OrderPage),
  },
  {
    path: 'tra-don',
    loadComponent: () => import('./features/shop/pages/lookup-page').then((m) => m.LookupPage),
  },
  {
    path: 'co-so',
    resolve: { branches: publicBranchesResolver },
    loadComponent: () =>
      import('./features/branches/pages/branch-list/branch-list-page').then(
        (m) => m.BranchListPage,
      ),
  },
  {
    path: 'chinh-sach/:slug',
    resolve: { policy: policyResolver },
    loadComponent: () => import('./features/legal/pages/policy-page').then((m) => m.PolicyPage),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];
