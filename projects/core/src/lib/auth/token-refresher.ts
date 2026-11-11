import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface TokenRefresher {
  refreshOnce(): Observable<string>;
}

export const TOKEN_REFRESHER = new InjectionToken<TokenRefresher>('TOKEN_REFRESHER');
