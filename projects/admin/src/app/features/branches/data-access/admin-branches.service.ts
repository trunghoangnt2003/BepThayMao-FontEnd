import { inject, Injectable } from '@angular/core';
import { BranchesService } from '@bepthaymao/api-client/endpoints';
@Injectable({ providedIn: 'root' })
export class AdminBranchesService {
  private readonly api = inject(BranchesService);
  list() {
    return this.api.listPublicBranches();
  }
}
