import { inject, Injectable } from '@angular/core';
import type { PublicBranch } from '@bepthaymao/api-client';
import { BranchesService } from '@bepthaymao/api-client/endpoints';
import { type ApiError, toApiError } from '@bepthaymao/core';
import { catchError, map, type Observable, of } from 'rxjs';

export type PublicBranchList =
  | { readonly kind: 'loaded'; readonly branches: readonly PublicBranch[] }
  | { readonly kind: 'error'; readonly error: ApiError };

@Injectable({ providedIn: 'root' })
export class PublicBranchesService {
  private readonly branches = inject(BranchesService);

  /** Never errors: SSR must always render a page, so failures become an `error` state. */
  list(): Observable<PublicBranchList> {
    return this.branches.listPublicBranches().pipe(
      map((branches): PublicBranchList => ({ kind: 'loaded', branches })),
      catchError((error: unknown) =>
        of<PublicBranchList>({ kind: 'error', error: toApiError(error) }),
      ),
    );
  }
}
