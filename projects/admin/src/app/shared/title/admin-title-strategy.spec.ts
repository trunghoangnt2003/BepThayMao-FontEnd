import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router, TitleStrategy } from '@angular/router';
import { AdminTitleStrategy } from './admin-title-strategy';
import { NotFoundPage } from '../../pages/not-found/not-found-page';

describe('Admin route titles', () => {
  it('adds the administration product title to a named route', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'missing', component: NotFoundPage, title: 'Không tìm thấy trang' },
        ]),
        { provide: TitleStrategy, useClass: AdminTitleStrategy },
      ],
    });
    await TestBed.inject(Router).navigateByUrl('/missing');
    expect(TestBed.inject(Title).getTitle()).toBe('Không tìm thấy trang | Quản trị Bếp Thầy Mão');
  });

  it('uses a safe default when the route has no title', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'missing', component: NotFoundPage }]),
        { provide: TitleStrategy, useClass: AdminTitleStrategy },
      ],
    });
    TestBed.inject(Title).setTitle('stale title');
    await TestBed.inject(Router).navigateByUrl('/missing');
    expect(TestBed.inject(Title).getTitle()).toBe('Quản trị Bếp Thầy Mão');
  });
});
