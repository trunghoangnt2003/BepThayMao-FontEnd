import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { KitchenLoader } from './kitchen-loader';
import { ROUTE_LOADER_DELAY_MS, RouteLoader } from './route-loader';

@Component({ template: '{{ name }}' })
class Blank {
  readonly name = 'Trang chậm';
}

describe('KitchenLoader', () => {
  it('rotates cooking steps and announces them as status', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(KitchenLoader);
    fixture.detectChanges();
    const html = fixture.nativeElement as HTMLElement;
    expect(html.getAttribute('role')).toBe('status');
    expect(html.textContent).toContain('Đang đồ xôi…');
    vi.advanceTimersByTime(1600);
    fixture.detectChanges();
    expect(html.textContent).toContain('Đang thêm nhân…');
    fixture.componentRef.setInput('label', 'Đang tìm cơ sở gần bạn…');
    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();
    expect(html.textContent).toContain('Đang tìm cơ sở gần bạn…');
    expect(html.classList).toContain('compact');
    fixture.destroy();
    vi.useRealTimers();
  });
});

describe('RouteLoader', () => {
  it('appears only when a navigation is slow and hides when it ends', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'cham', component: Blank }])],
    });
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(RouteLoader);
    const html = fixture.nativeElement as HTMLElement;
    const router = TestBed.inject(Router);
    const done = router.navigateByUrl('/cham');
    fixture.detectChanges();
    expect(html.querySelector('.veil')).toBeNull();
    vi.advanceTimersByTime(ROUTE_LOADER_DELAY_MS + 10);
    fixture.detectChanges();
    vi.useRealTimers();
    await done;
    await fixture.whenStable();
    expect(html.querySelector('.veil')).toBeNull();
    fixture.destroy();
  });
});
