import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { PublicBranchesService, PublicBranchList } from './public-branches.service';
export const publicBranchesResolver: ResolveFn<PublicBranchList> = () =>
  inject(PublicBranchesService).list();
