import { TestBed } from '@angular/core/testing';
import type { PublicBranch } from '@bepthaymao/api-client';
import type { ApiError } from '@bepthaymao/core';
import { Subject } from 'rxjs';
import { AdminBranchesService } from '../../data-access/admin-branches.service';
import { BranchListPage } from './branch-list-page';

const branches: PublicBranch[] = [
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
    phone: '02800000002',
    openTime: '07:00',
    closeTime: '21:00',
  },
];

function setup() {
  const requests: Subject<readonly PublicBranch[]>[] = [];
  const service = {
    list: () => {
      const request = new Subject<readonly PublicBranch[]>();
      requests.push(request);
      return request.asObservable();
    },
  };
  TestBed.configureTestingModule({
    providers: [{ provide: AdminBranchesService, useValue: service }],
  });
  const fixture = TestBed.createComponent(BranchListPage);
  fixture.detectChanges();
  return { fixture, requests, element: fixture.nativeElement as HTMLElement };
}

function respond(
  request: Subject<readonly PublicBranch[]> | undefined,
  value: readonly PublicBranch[],
) {
  request?.next(value);
  request?.complete();
}

describe('Admin BranchListPage', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the skeleton only after 200ms of loading', () => {
    vi.useFakeTimers();
    const { fixture, element } = setup();
    expect(element.querySelector('[aria-busy="true"]')).not.toBeNull();
    vi.advanceTimersByTime(199);
    fixture.detectChanges();
    expect(element.querySelectorAll('.skeleton-row').length).toBe(0);
    vi.advanceTimersByTime(1);
    fixture.detectChanges();
    expect(element.querySelectorAll('.skeleton-row').length).toBe(3);
    expect(element.querySelector('[role="status"]')?.textContent).toContain(
      'Đang tải danh sách cơ sở…',
    );
  });

  it('renders a two column table with row headers and opening hours', async () => {
    const { fixture, requests, element } = setup();
    respond(requests[0], branches);
    await fixture.whenStable();
    expect(element.querySelector('h1')?.textContent).toBe('Danh sách cơ sở');
    const headers = [...element.querySelectorAll('thead th')].map((th) => th.textContent.trim());
    expect(headers).toEqual(['Cơ sở', 'Giờ nhận đơn']);
    const rowHeaders = element.querySelectorAll('tbody th[scope="row"]');
    expect(rowHeaders.length).toBe(2);
    expect(rowHeaders[0].querySelector('.name')?.textContent).toBe('Cơ sở Mẫu 1');
    expect(rowHeaders[0].textContent).toContain('Số 1 Đường Mẫu');
    expect(rowHeaders[0].querySelector('a')).toBeNull();
    expect(element.querySelector('tbody td')?.textContent.trim()).toBe('06:00 đến 21:30');
    expect(element.querySelector('[aria-busy="true"]')).toBeNull();
  });

  it('shows the empty state without a create button', async () => {
    const { fixture, requests, element } = setup();
    respond(requests[0], []);
    await fixture.whenStable();
    expect(element.querySelector('h2')?.textContent).toBe('Chưa có cơ sở nào');
    expect(element.textContent).toContain('Danh sách sẽ hiện ở đây khi có cơ sở mở nhận đơn.');
    expect(element.textContent).not.toContain('Tạo cơ sở mới');
    expect(element.querySelector('button')).toBeNull();
  });
});

describe('Admin BranchListPage errors', () => {
  it('shows the correlation id on error and retries', async () => {
    const { fixture, requests, element } = setup();
    const error: ApiError = {
      kind: 'http',
      status: 500,
      detail: 'secret detail',
      correlationId: 'corr-42',
    };
    requests[0].error(error);
    await fixture.whenStable();
    expect(element.querySelector('h2')?.textContent).toBe('Không tải được danh sách cơ sở');
    expect(element.textContent).toContain(
      'Kiểm tra kết nối mạng rồi thử lại. Nếu vẫn lỗi, gửi mã corr-42 cho đội phát triển.',
    );
    expect(element.textContent).not.toContain('secret detail');
    const retry = element.querySelector('button');
    expect(retry?.textContent.trim()).toBe('Thử lại');
    retry?.click();
    expect(requests.length).toBe(2);
    respond(requests[1], branches);
    await fixture.whenStable();
    expect(element.querySelectorAll('tbody tr').length).toBe(2);
  });
});
