import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotFoundPage } from './not-found-page';

it('renders one accessible heading and a route back to branches', async () => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(NotFoundPage);
  await fixture.whenStable();
  const element = fixture.nativeElement as HTMLElement;
  expect(element.querySelectorAll('h1').length).toBe(1);
  expect(element.querySelector('h1')?.textContent).toBe('Không tìm thấy trang');
  expect(element.querySelector('h1')?.getAttribute('tabindex')).toBe('-1');
  expect(element.querySelector('a')?.getAttribute('href')).toBe('/branches');
  expect(element.textContent).toContain('Về trang của tôi');
});
