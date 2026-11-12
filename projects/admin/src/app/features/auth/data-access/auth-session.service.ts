import { inject, Injectable } from '@angular/core';
import { TokenPair } from '@bepthaymao/api-client';
import { AuthService } from '@bepthaymao/api-client/endpoints';
import { AccessTokenStore } from '@bepthaymao/core';
import { TokenRefresher } from '@bepthaymao/core';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, of, shareReplay, tap, throwError } from 'rxjs';
import { roleHome } from './role-home';

@Injectable({ providedIn: 'root' })
export class AuthSessionService implements TokenRefresher {
  private readonly api = inject(AuthService);
  private readonly router = inject(Router);
  private refreshing: Observable<TokenPair> | null = null;
  readonly store = inject(AccessTokenStore);

  refreshOnce(): Observable<string> {
    return this.refresh(true).pipe(map((pair) => pair.accessToken));
  }

  restore(): Observable<TokenPair | null> {
    return this.refresh(false).pipe(catchError(() => of(null)));
  }

  roleHome(): string {
    return roleHome(this.store.session()?.role);
  }

  private refresh(reportExpiry: boolean): Observable<TokenPair> {
    if (this.refreshing) return this.refreshing;
    const hadSession = this.store.session() !== null;
    this.refreshing = this.api.refreshToken().pipe(
      tap((pair) => {
        this.store.set(pair);
      }),
      catchError((error: unknown) => {
        this.store.clear();
        if (reportExpiry && hadSession) {
          void this.router.navigate(['/login'], {
            queryParams: { reason: 'expired', returnUrl: this.router.url },
          });
        }
        return throwError(() => error);
      }),
      finalize(() => {
        this.refreshing = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.refreshing;
  }

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
