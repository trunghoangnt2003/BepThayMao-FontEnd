import { inject, Injectable } from '@angular/core';
import { TokenPair } from '@bepthaymao/api-client';
import { AuthService } from '@bepthaymao/api-client/endpoints';
import { AccessTokenStore } from '@bepthaymao/core';
import { catchError, finalize, Observable, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly api = inject(AuthService);
  readonly store = inject(AccessTokenStore);

  login(identifier: string, password: string): Observable<TokenPair> {
    return this.api.login({ identifier, password }).pipe(
      tap((pair) => {
        this.store.set(pair);
      }),
    );
  }

  logout(): Observable<void> {
    return this.api.logout().pipe(
      catchError(() => of(undefined)),
      finalize(() => {
        this.store.clear();
      }),
    );
  }
}
