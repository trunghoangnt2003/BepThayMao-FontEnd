import { Injectable } from '@angular/core';
import { BranchSettingsRequest, ManagerBranchView } from '@bepthaymao/api-client';
import { Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ManagerSettingsService {
  get(): Observable<ManagerBranchView> {
    return throwError(() => new Error('not implemented'));
  }

  update(body: BranchSettingsRequest): Observable<ManagerBranchView> {
    return throwError(() => new Error(`not implemented: ${body.phone}`));
  }
}
