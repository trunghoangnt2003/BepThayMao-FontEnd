import { inject, Injectable } from '@angular/core';
import {
  BranchOwnerSettingsRequest,
  BranchResponse,
  CreateBranchRequest,
} from '@bepthaymao/api-client';
import { OwnerService } from '@bepthaymao/api-client/endpoints';
import { Observable, throwError } from 'rxjs';

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
    return throwError(() => new Error(`not implemented: ${id} ${body.name}`));
  }

  resetPassword(id: string, newPassword: string): Observable<void> {
    return throwError(() => new Error(`not implemented: ${id} ${String(newPassword.length)}`));
  }
}
