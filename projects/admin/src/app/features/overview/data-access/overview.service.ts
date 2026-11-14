import { inject, Injectable } from '@angular/core';
import { OverviewDto } from '@bepthaymao/api-client';
import { ManagerService, OwnerService } from '@bepthaymao/api-client/endpoints';
import { AccessTokenStore } from '@bepthaymao/core';
import { Observable } from 'rxjs';

/** Tổng quan hôm nay: Owner xem mọi cơ sở của mình hoặc một cơ sở, Quản lý xem cơ sở mình. */
@Injectable({ providedIn: 'root' })
export class OverviewService {
  private readonly owner = inject(OwnerService);
  private readonly manager = inject(ManagerService);
  private readonly store = inject(AccessTokenStore);

  load(branchId: string | null): Observable<OverviewDto> {
    if (this.store.session()?.role !== 'Owner') return this.manager.getManagerOverview();
    return this.owner.getOwnerOverview(branchId ? { branchId } : {});
  }
}
