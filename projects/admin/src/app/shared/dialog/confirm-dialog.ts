import { Injectable } from '@angular/core';

export interface ConfirmOptions {
  readonly title: string;
  readonly body: string;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly danger?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialog {
  confirm(options: ConfirmOptions): Promise<boolean> {
    return Promise.resolve(options.body === '');
  }
}
