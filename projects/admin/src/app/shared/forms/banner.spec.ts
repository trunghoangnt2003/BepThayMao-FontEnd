import { TestBed } from '@angular/core/testing';
import { Banner } from './banner';

async function render(kind?: 'error' | 'info'): Promise<HTMLElement> {
  const fixture = TestBed.createComponent(Banner);
  if (kind) fixture.componentRef.setInput('kind', kind);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

it('announces errors as an alert with a warning icon', async () => {
  const banner = await render('error');
  expect(banner.getAttribute('role')).toBe('alert');
  expect(banner.getAttribute('data-kind')).toBe('error');
  expect(banner.querySelector('btm-icon svg')).not.toBeNull();
});

it('announces information as a status by default', async () => {
  const banner = await render();
  expect(banner.getAttribute('role')).toBe('status');
  expect(banner.querySelector('btm-icon svg')).not.toBeNull();
});
