import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AdminTitleStrategy } from './admin-title-strategy';

it('uses the administrative title and falls back without a page title', () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const strategy = TestBed.inject(AdminTitleStrategy);
  const router = TestBed.inject(Router);
  strategy.updateTitle(router.routerState.snapshot);
  expect(document.title).toBe('Quản trị Bếp Thầy Mão');
  vi.spyOn(strategy, 'buildTitle').mockReturnValue('Danh sách cơ sở');
  strategy.updateTitle(router.routerState.snapshot);
  expect(document.title).toBe('Danh sách cơ sở | Quản trị Bếp Thầy Mão');
});
