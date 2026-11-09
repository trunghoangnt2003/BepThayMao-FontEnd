import { Routes } from '@angular/router';
import { publicBranchesResolver } from './features/branches/data-access/public-branches.resolver';
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'co-so' },
  {
    path: 'co-so',
    resolve: { branches: publicBranchesResolver },
    loadComponent: () =>
      import('./features/branches/pages/branch-list/branch-list-page').then(
        (m) => m.BranchListPage,
      ),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];
