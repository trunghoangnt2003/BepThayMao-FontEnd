import { inject, Injectable } from '@angular/core';
import type { PublicBranch } from '@bepthaymao/api-client';
import { BranchesService } from '@bepthaymao/api-client/endpoints';
import type { Observable } from 'rxjs';

/** Errors arrive as ApiError: problemInterceptor in core converts them once. */
@Injectable({ providedIn: 'root' })
export class AdminBranchesService {
  private readonly branches = inject(BranchesService);

  list(): Observable<readonly PublicBranch[]> {
    return this.branches.listPublicBranches();
  }
}
