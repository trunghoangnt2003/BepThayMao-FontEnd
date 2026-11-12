import { inject, Injectable } from '@angular/core';
import { BranchSettingsRequest, ManagerBranchView } from '@bepthaymao/api-client';
import { ManagerService } from '@bepthaymao/api-client/endpoints';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ManagerSettingsService {
  private readonly api = inject(ManagerService);

  get(): Observable<ManagerBranchView> {
    return this.api.getManagerBranchSettings();
  }

  /** Copies the five manager-editable keys only, so an owner-only field can never be sent from here. */
  update(body: BranchSettingsRequest): Observable<ManagerBranchView> {
    return this.api.updateManagerBranchSettings({
      phone: body.phone,
      openTime: body.openTime,
      closeTime: body.closeTime,
      abandonedThresholdMinutes: body.abandonedThresholdMinutes,
      zaloRecipientIds: body.zaloRecipientIds,
    });
  }
}
