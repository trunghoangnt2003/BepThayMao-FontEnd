import { TestBed } from '@angular/core/testing';
import { BranchListPage } from './branch-list-page';
import { toTelHref } from '../../ui/tel-href';

describe('Customer branch directory', () => {
  it('renders public data and phone links', async () => {
    const fixture = TestBed.createComponent(BranchListPage);
    fixture.componentRef.setInput('branches', {
      kind: 'loaded',
      branches: [
        {
          id: '1',
          name: 'Cơ sở Mẫu 1',
          address: 'Địa chỉ mẫu',
          phone: '0901234567',
          openTime: '06:00',
          closeTime: '21:30',
        },
      ],
    });
    await fixture.whenStable();
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelectorAll('article')).toHaveLength(1);
    expect(html.querySelector('a')?.href).toBe('tel:+84901234567');
    expect(html.textContent).toContain('06:00 đến 21:30');
    expect(document.title).toBe('Các cơ sở | Bếp Thầy Mão');
  });
  it('renders empty and error states with a normal reload link', async () => {
    const fixture = TestBed.createComponent(BranchListPage);
    fixture.componentRef.setInput('branches', { kind: 'loaded', branches: [] });
    await fixture.whenStable();
    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Chưa có cơ sở nào đang hoạt động');
    fixture.componentRef.setInput('branches', {
      kind: 'error',
      error: { kind: 'network', status: 0 },
    });
    await fixture.whenStable();
    expect(html.textContent).toContain('Không tải được danh sách cơ sở');
    expect(html.querySelector('a')?.getAttribute('href')).toBe('/co-so');
  });
  it('normalizes supported Vietnamese telephone formats', () => {
    expect(toTelHref('0280 000 0001')).toBe('tel:+842800000001');
    expect(toTelHref('0901.234.567')).toBe('tel:+84901234567');
    expect(toTelHref('+84901234567')).toBe('tel:+84901234567');
  });
});
