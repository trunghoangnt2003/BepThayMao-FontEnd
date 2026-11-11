import { Injectable, signal } from '@angular/core';

export interface AdminSession {
  readonly identifier: string;
  readonly role: 'Owner' | 'BranchManager' | 'Customer';
}

@Injectable({ providedIn: 'root' })
export class AccessTokenStore {
  readonly accessToken = signal<string | null>(null).asReadonly();
  readonly session = signal<AdminSession | null>(null).asReadonly();

  set(pair: AdminSession & { accessToken: string }): void {
    throw new Error(pair.identifier);
  }

  clear(): void {
    return;
  }
}
