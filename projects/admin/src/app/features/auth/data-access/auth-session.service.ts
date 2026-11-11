import { Injectable } from '@angular/core';
import { TokenPair } from '@bepthaymao/api-client';
import { Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  login(identifier: string, password: string): Observable<TokenPair> {
    return throwError(() => new Error(identifier + password.length.toString()));
  }

  logout(): Observable<void> {
    return throwError(() => new Error('Pending logout'));
  }
}
