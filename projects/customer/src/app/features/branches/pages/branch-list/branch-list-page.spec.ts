import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { SITE_URL } from '../../../../shared/seo/site-url';
import type { PublicBranchList } from '../../data-access/public-branches.service';
import { BranchListPage } from './branch-list-page';

const branches = [
  {
    id: 'a',
    name: 'Cơ sở Mẫu 1',
    address: 'Số 1 Đường Mẫu',
    phone: '02800000001',
    openTime: '06:00',
    closeTime: '21:30',
  },
  {
    id: 'b',
    name: 'Cơ sở Mẫu 2',
    address: 'Số 2 Đường Mẫu',
    phone: '0901 234 567',
    openTime: '07:00',
    closeTime: '21:00',
  },
];

async function render(state: PublicBranchList): Promise<HTMLElement> {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: SITE_URL, useValue: 'https://bep.example' }],
  });
  const fixture = TestBed.createComponent(BranchListPage);
  fixture.componentRef.setInput('branches', state);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('BranchListPage', () => {
  it('renders one article per branch with labelled details and a tel link', async () => {
    const element = await render({ kind: 'loaded', branches });
    expect(element.querySelector('h1')?.textContent).toBe('Các cơ sở của Bếp Thầy Mão');
    const articles = element.querySelectorAll('article');
    expect(articles.length).toBe(2);
    const [first, second] = [...articles];
    expect(first.querySelector('h2')?.textContent.trim()).toBe('Cơ sở Mẫu 1');
    const labels = [...first.querySelectorAll('dt')].map((dt) => dt.textContent.trim());
    expect(labels).toEqual(['Địa chỉ', 'Điện thoại', 'Nhận đơn']);
    expect(first.querySelector('a')?.getAttribute('href')).toBe('tel:+842800000001');
    expect(first.textContent).toContain('06:00 đến 21:30');
    expect(second.querySelector('a')?.getAttribute('href')).toBe('tel:+84901234567');
  });

  it('shows the empty state with a reload link', async () => {
    const element = await render({ kind: 'loaded', branches: [] });
    expect(element.querySelector('h2')?.textContent).toBe('Chưa có cơ sở nào đang hoạt động');
    expect(element.textContent).toContain('Danh sách sẽ hiện ở đây khi có cơ sở mở nhận đơn.');
    const reload = element.querySelector('a');
    expect(reload?.textContent.trim()).toBe('Tải lại trang');
    expect(reload?.getAttribute('href')).toBe('/co-so');
    expect(element.querySelectorAll('article').length).toBe(0);
  });

  it('shows the error state with a reload link', async () => {
    const element = await render({ kind: 'error', error: { kind: 'network', status: 0 } });
    expect(element.querySelector('h2')?.textContent).toBe('Không tải được danh sách cơ sở');
    expect(element.textContent).toContain('Kiểm tra kết nối mạng rồi tải lại trang.');
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/co-so');
  });

  it('sets page metadata', async () => {
    await render({ kind: 'loaded', branches });
    expect(TestBed.inject(Title).getTitle()).toBe('Các cơ sở | Bếp Thầy Mão');
    const head = TestBed.inject(DOCUMENT).head;
    expect(head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'Danh sách cơ sở của Bếp Thầy Mão: địa chỉ, số điện thoại và giờ nhận đơn.',
    );
    expect(head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://bep.example/co-so',
    );
  });
});
