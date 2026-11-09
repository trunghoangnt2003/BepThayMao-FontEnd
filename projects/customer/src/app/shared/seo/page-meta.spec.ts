import { TestBed } from '@angular/core/testing';
import { PageMeta, SITE_URL } from './page-meta';

describe('Page metadata', () => {
  it('builds canonical from configured origin and sets Vietnamese metadata', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: SITE_URL, useValue: 'https://example.com' }],
    });
    TestBed.inject(PageMeta).set({
      title: 'Các cơ sở',
      description: 'Địa chỉ cơ sở',
      path: '/co-so',
    });
    expect(document.title).toBe('Các cơ sở | Bếp Thầy Mão');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://example.com/co-so',
    );
    expect(document.querySelector('meta[property="og:locale"]')?.getAttribute('content')).toBe(
      'vi_VN',
    );
  });
});
