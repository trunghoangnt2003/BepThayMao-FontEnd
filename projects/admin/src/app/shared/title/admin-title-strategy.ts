import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

/** Tab title for a page: `{page} | Quản trị Bếp Thầy Mão`. */
export function adminTitle(page: string | undefined): string {
  return page ? `${page} | Quản trị Bếp Thầy Mão` : 'Quản trị Bếp Thầy Mão';
}

@Injectable({ providedIn: 'root' })
export class AdminTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  override updateTitle(snapshot: RouterStateSnapshot): void {
    const page = this.buildTitle(snapshot);
    this.title.setTitle(adminTitle(page));
  }
}
