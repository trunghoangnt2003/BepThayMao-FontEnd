import { computed, Injectable, signal } from '@angular/core';

export interface AdminSession {
  readonly identifier: string;
  readonly role: 'Owner' | 'BranchManager' | 'Customer';
}

@Injectable({ providedIn: 'root' })
export class AccessTokenStore {
  private readonly value = signal<(AdminSession & { accessToken: string }) | null>(null);
  readonly accessToken = computed(() => this.value()?.accessToken ?? null);
  readonly session = computed<AdminSession | null>(() => {
    const value = this.value();
    return value ? { identifier: value.identifier, role: value.role } : null;
  });

  set(pair: AdminSession & { accessToken: string }): void {
    this.value.set(pair);
  }

  clear(): void {
    this.value.set(null);
  }
}
