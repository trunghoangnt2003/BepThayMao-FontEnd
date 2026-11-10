import { Routes } from '@angular/router';
import { publicBranchesResolver } from './features/branches/data-access/public-branches.resolver';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'co-so' },
  {
    path: 'co-so',
    loadComponent: () =>
      import('./features/branches/pages/branch-list/branch-list-page').then(
        (module) => module.BranchListPage,
      ),
    resolve: { branches: publicBranchesResolver },
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found-page').then((module) => module.NotFoundPage),
  },
];
