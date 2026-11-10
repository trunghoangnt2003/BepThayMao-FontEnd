import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import { type PublicBranchList, PublicBranchesService } from './public-branches.service';

/** SSR waits for resolvers, so the first HTML already contains the branches. */
export const publicBranchesResolver: ResolveFn<PublicBranchList> = () =>
  inject(PublicBranchesService).list();
