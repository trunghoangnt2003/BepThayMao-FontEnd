import { inject, Injectable } from '@angular/core';
import {
  BranchOwnerSettingsRequest,
  BranchResponse,
  CreateBranchRequest,
} from '@bepthaymao/api-client';
import { OwnerService } from '@bepthaymao/api-client/endpoints';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OwnerBranchesService {
  private readonly api = inject(OwnerService);

  list(): Observable<BranchResponse[]> {
    return this.api.listOwnerBranches();
  }

  create(body: CreateBranchRequest): Observable<BranchResponse> {
    return this.api.createOwnerBranch(body);
  }

  get(id: string): Observable<BranchResponse> {
    return this.api.getOwnerBranch(id);
  }

  update(id: string, body: BranchOwnerSettingsRequest): Observable<BranchResponse> {
    return this.api.updateOwnerBranch(id, body);
  }

  resetPassword(id: string, newPassword: string): Observable<void> {
    return this.api.resetBranchManagerPassword(id, { newPassword });
  }
}
