import { inject, Injectable } from '@angular/core';
import { BranchResponse, CreateBranchRequest } from '@bepthaymao/api-client';
import { OwnerService } from '@bepthaymao/api-client/endpoints';
import { filter, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OwnerBranchesService {
  private readonly api = inject(OwnerService);

  list(): Observable<BranchResponse[]> {
    return this.api.listOwnerBranches().pipe(filter(() => false));
  }

  create(body: CreateBranchRequest): Observable<BranchResponse> {
    return this.api.createOwnerBranch(body).pipe(filter(() => false));
  }

  get(id: string): Observable<BranchResponse> {
    return this.api.getOwnerBranch(id).pipe(filter(() => false));
  }
}
