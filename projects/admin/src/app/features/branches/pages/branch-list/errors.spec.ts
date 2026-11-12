import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { BranchResponse } from '@bepthaymao/api-client';
import { BranchListPage } from './branch-list-page';
import { OwnerBranchesService } from '../../data-access/owner-branches.service';

it.each([
  new HttpErrorResponse({ status: 0 }),
  new HttpErrorResponse({ status: 500, error: '<html>failure</html>' }),
  new HttpErrorResponse({
    status: 400,
    error: {
      title: 'Invalid',
      detail: 'private-detail',
      errors: { name: ['Required'] },
      correlationId: 'body-id',
    },
  }),
  new HttpErrorResponse({
    status: 400,
    error: { title: {}, detail: 42, errors: { name: 1 } },
    headers: new HttpHeaders({ 'X-Correlation-Id': 'header-id' }),
  }),
  new HttpErrorResponse({ status: 500, error: { errors: ['invalid'] } }),
  new Error('private-detail'),
  null,
])('keeps error UI safe across malformed and transport responses', async (error: unknown) => {
  TestBed.configureTestingModule({
    providers: [
      { provide: OwnerBranchesService, useValue: { list: () => throwError(() => error) } },
    ],
  });
  const fixture = TestBed.createComponent(BranchListPage);
  await fixture.whenStable();
  const html = fixture.nativeElement as HTMLElement;
  expect(html.textContent).toContain('Không tải được danh sách cơ sở');
  expect(html.textContent).not.toContain('private-detail');
});

describe('A2 states', () => {
  function setup(source: () => unknown) {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: OwnerBranchesService, useValue: { list: source } }],
    });
    const fixture = TestBed.createComponent(BranchListPage);
    return { fixture, html: fixture.nativeElement as HTMLElement };
  }

  it('explains the empty list and offers exactly one primary create action', async () => {
    const { fixture, html } = setup(() => of([]));
    await fixture.whenStable();
    expect(html.querySelector('h2')?.textContent.trim()).toBe('Chưa có cơ sở nào');
    expect(html.textContent).toContain('Tạo cơ sở đầu tiên để cấp tài khoản cho quản lý.');
    expect(html.querySelectorAll('.btn--primary')).toHaveLength(1);
    const primary = html.querySelector('.btn--primary');
    expect(primary?.textContent.trim()).toBe('Tạo cơ sở mới');
    expect(primary?.getAttribute('href')).toBe('/owner/branches/new');
  });

  it('marks the loading region busy with a hidden status message', async () => {
    const pending = new Subject<BranchResponse[]>();
    const { fixture, html } = setup(() => pending);
    await fixture.whenStable();
    expect(html.querySelector('section')?.getAttribute('aria-busy')).toBe('true');
    expect(html.querySelector('[role="status"]')?.textContent.trim()).toBe(
      'Đang tải danh sách cơ sở…',
    );
  });

  it('shows the correlation id and retries on demand after a 5xx', async () => {
    const failing = new HttpErrorResponse({ status: 500, error: { correlationId: 'abc-500' } });
    const list = vi
      .fn()
      .mockReturnValueOnce(throwError(() => failing))
      .mockReturnValue(of([]));
    const { fixture, html } = setup(list);
    await fixture.whenStable();
    expect(html.querySelector('h2')?.textContent.trim()).toBe('Không tải được danh sách cơ sở');
    expect(html.textContent).toContain('gửi mã abc-500 cho đội phát triển');
    const retry = html.querySelector<HTMLButtonElement>('button');
    expect(retry?.textContent.trim()).toBe('Thử lại');
    retry?.click();
    await fixture.whenStable();
    expect(list).toHaveBeenCalledTimes(2);
    expect(html.querySelector('h2')?.textContent.trim()).toBe('Chưa có cơ sở nào');
  });
});
