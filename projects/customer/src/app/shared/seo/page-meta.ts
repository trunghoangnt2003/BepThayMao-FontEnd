import { DOCUMENT } from '@angular/common';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export const SITE_URL = new InjectionToken<string>('SITE_URL', {
  factory: () => 'http://localhost:8080',
});

@Injectable({ providedIn: 'root' })
export class PageMeta {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly siteUrl = inject(SITE_URL);

  set(value: { title: string; description: string; path: string; robots?: string }): void {
    const title = `${value.title} | Bếp Thầy Mão`;
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: value.description });
    this.meta.updateTag({ name: 'robots', content: value.robots ?? 'index,follow' });
    for (const [property, content] of Object.entries({
      'og:title': title,
      'og:description': value.description,
      'og:type': 'website',
      'og:locale': 'vi_VN',
      'og:site_name': 'Bếp Thầy Mão',
    }))
      this.meta.updateTag({ property, content });
    const canonical =
      this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]') ??
      this.document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = new URL(value.path, this.siteUrl).href;
    this.document.head.appendChild(canonical);
  }
}
