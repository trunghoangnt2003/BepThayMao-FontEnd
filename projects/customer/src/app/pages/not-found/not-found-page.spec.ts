import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotFoundPage } from './not-found-page';
import { SITE_URL } from '../../shared/seo/site-url';

describe('NotFoundPage', () => {
  it('renders one heading and a link back to public branches', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: SITE_URL, useValue: 'https://bep.example' }],
    });
    const fixture = TestBed.createComponent(NotFoundPage);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('h1').length).toBe(1);
    expect(element.querySelector('h1')?.textContent).toBe('Không tìm thấy trang');
    expect(element.textContent).toContain('Đường dẫn có thể đã sai hoặc trang đã được chuyển.');
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/co-so');
  });
});
