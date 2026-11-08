import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { PageMeta } from './page-meta';
import { SITE_URL } from './site-url';

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [{ provide: SITE_URL, useValue: 'https://bep.example' }],
  });
});

afterEach(() => {
  TestBed.inject(DOCUMENT)
    .querySelectorAll('link[rel="canonical"]')
    .forEach((link) => {
      link.remove();
    });
});

it('sets Vietnamese titles, metadata and an absolute canonical URL', () => {
  TestBed.inject(PageMeta).set({
    title: 'Cơ sở',
    description: 'Danh sách cơ sở',
    path: '/co-so',
  });
  expect(TestBed.inject(Title).getTitle()).toBe('Cơ sở | Bếp Thầy Mão');
  const meta = TestBed.inject(Meta);
  expect(meta.getTag('name="description"')?.content).toBe('Danh sách cơ sở');
  expect(meta.getTag('property="og:title"')?.content).toBe('Cơ sở | Bếp Thầy Mão');
  expect(meta.getTag('property="og:description"')?.content).toBe('Danh sách cơ sở');
  expect(meta.getTag('property="og:type"')?.content).toBe('website');
  expect(meta.getTag('property="og:locale"')?.content).toBe('vi_VN');
  expect(meta.getTag('property="og:site_name"')?.content).toBe('Bếp Thầy Mão');
  expect(meta.getTag('property="og:image"')).toBeNull();
  expect(
    TestBed.inject(DOCUMENT).querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href,
  ).toBe('https://bep.example/co-so');
});

it('updates canonical without duplicates, strips query data and resets robots', () => {
  const service = TestBed.inject(PageMeta);
  service.set({
    title: 'Không thấy',
    description: 'Không thấy',
    path: '/missing',
    robots: 'noindex',
  });
  expect(TestBed.inject(Meta).getTag('name="robots"')?.content).toBe('noindex');
  service.set({
    title: 'Cơ sở',
    description: 'Danh sách',
    path: '/co-so?private=value#fragment',
  });
  const links = TestBed.inject(DOCUMENT).querySelectorAll<HTMLLinkElement>('link[rel="canonical"]');
  expect(links.length).toBe(1);
  expect(links.item(0).href).toBe('https://bep.example/co-so');
  expect(TestBed.inject(Meta).getTag('name="robots"')).toBeNull();
});

it('keeps canonical on the configured origin for a protocol-relative path', () => {
  TestBed.inject(PageMeta).set({
    title: 'Không thấy',
    description: 'Không thấy',
    path: '//other.example',
  });
  expect(
    TestBed.inject(DOCUMENT).querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href,
  ).toBe('https://bep.example/');
});
