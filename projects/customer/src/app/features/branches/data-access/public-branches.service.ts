import { inject, Injectable } from '@angular/core';
import { PublicBranch } from '@bepthaymao/api-client';
import { BranchesService } from '@bepthaymao/api-client/endpoints';
import { ApiError, toApiError } from '@bepthaymao/core';
import { catchError, map, of } from 'rxjs';

export type PublicBranchList =
  | { readonly kind: 'loaded'; readonly branches: readonly PublicBranch[] }
  | { readonly kind: 'error'; readonly error: ApiError };
@Injectable({ providedIn: 'root' })
export class PublicBranchesService {
  private readonly api = inject(BranchesService);
  list() {
    return this.api.listPublicBranches().pipe(
      map((branches): PublicBranchList => ({ kind: 'loaded', branches })),
      catchError((error: unknown) =>
        of<PublicBranchList>({ kind: 'error', error: toApiError(error) }),
      ),
    );
  }
}
