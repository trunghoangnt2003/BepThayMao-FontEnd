import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SITE_URL } from './site-url';

interface PageMetadata {
  readonly title: string;
  readonly description: string;
  readonly path: string;
  readonly robots?: string;
}

@Injectable({ providedIn: 'root' })
export class PageMeta {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly siteUrl = inject(SITE_URL);

  set(page: PageMetadata): void {
    const title = `${page.title} | Bếp Thầy Mão`;
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: page.description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: page.description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:locale', content: 'vi_VN' });
    this.meta.updateTag({ property: 'og:site_name', content: 'Bếp Thầy Mão' });
    if (page.robots) this.meta.updateTag({ name: 'robots', content: page.robots });
    else this.meta.removeTag('name="robots"');

    let canonical = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      this.document.head.appendChild(canonical);
    }
    const path = page.path.startsWith('/') && !page.path.startsWith('//') ? page.path : '/';
    const url = new URL(path, new URL(this.siteUrl).origin);
    url.search = '';
    url.hash = '';
    canonical.setAttribute('href', url.href);
  }
}
