import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { BranchResponse } from '@bepthaymao/api-client';
import { OwnerBranchesService } from '../../data-access/owner-branches.service';
import { branchFixture } from '../../testing/branch-fixture';
import { IconComponent } from '../../../../shared/icon/icon';
import { BranchListPage } from './branch-list-page';

let responses: Subject<BranchResponse[]>;
beforeEach(() => {
  responses = new Subject<BranchResponse[]>();
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: OwnerBranchesService, useValue: { list: () => responses } },
    ],
  });
});
it('shows loading, public rows, and empty state', async () => {
  const fixture = TestBed.createComponent(BranchListPage);
  await fixture.whenStable();
  expect(fixture.componentInstance.state()).toBe('loading');
  expect(fixture.componentInstance.showSkeleton()).toBe(false);
  responses.next([branchFixture({ name: 'Mẫu', address: 'Địa chỉ' })]);
  responses.complete();
  await fixture.whenStable();
  const html = fixture.nativeElement as HTMLElement;
  expect(html.querySelectorAll('tbody tr')).toHaveLength(1);
  expect(html.textContent).toContain('06:00 đến 21:30');
  responses = new Subject<BranchResponse[]>();
  fixture.componentInstance.load();
  responses.next([]);
  responses.complete();
  await fixture.whenStable();
  expect(html.textContent).toContain('Chưa có cơ sở nào');
});
it('renders safe errors with correlation and permits retry', async () => {
  const fixture = TestBed.createComponent(BranchListPage);
  responses.error({
    kind: 'http',
    status: 500,
    correlationId: 'real-id',
    detail: 'private-detail',
  });
  await fixture.whenStable();
  const html = fixture.nativeElement as HTMLElement;
  expect(html.textContent).toContain('real-id');
  expect(html.textContent).not.toContain('private-detail');
  responses = new Subject<BranchResponse[]>();
  html.querySelector('button')?.click();
  responses.next([]);
  responses.complete();
  await fixture.whenStable();
  expect(fixture.componentInstance.state()).toBe('loaded');
});
it('only shows skeleton after 200ms and cancels it when destroyed', async () => {
  vi.useFakeTimers();
  try {
    const fixture = TestBed.createComponent(BranchListPage);
    await vi.advanceTimersByTimeAsync(199);
    expect(fixture.componentInstance.showSkeleton()).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(fixture.componentInstance.showSkeleton()).toBe(true);
    fixture.destroy();
    expect(fixture.componentInstance.showSkeleton()).toBe(false);
  } finally {
    vi.useRealTimers();
  }
});

describe('owner branch rows', () => {
  async function render(branches: BranchResponse[]) {
    const fixture = TestBed.createComponent(BranchListPage);
    responses.next(branches);
    responses.complete();
    await fixture.whenStable();
    return fixture;
  }

  it('links the branch name to its edit screen and shows hours', async () => {
    const branch = branchFixture({ id: 'abc-123', name: 'Cơ sở Một' });
    const fixture = await render([branch]);
    const link = (fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>(
      'tbody th a',
    );
    expect(link?.textContent.trim()).toBe('Cơ sở Một');
    expect(link?.getAttribute('href')).toBe('/owner/branches/abc-123');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('06:00 đến 21:30');
  });

  it('shows the receiving status with a distinct icon and text', async () => {
    const fixture = await render([
      branchFixture({ id: '1', isActive: true }),
      branchFixture({ id: '2', isActive: false }),
    ]);
    const cells = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('tbody td[data-label="Trạng thái"]'),
    );
    expect(cells.map((cell) => cell.textContent.trim())).toEqual(['Đang nhận đơn', 'Đã tắt']);
    const icons = fixture.debugElement
      .queryAll(By.directive(IconComponent))
      .map((icon) => (icon.componentInstance as IconComponent).name());
    expect(icons).toEqual(['check-circle', 'prohibit']);
  });

  it('offers one create link to the new branch screen above the table', async () => {
    const fixture = await render([branchFixture()]);
    const links = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>('a[hlmBtn]'),
    );
    expect(links.map((link) => link.textContent.trim())).toEqual(['Tạo cơ sở mới']);
    expect(links[0]?.getAttribute('href')).toBe('/owner/branches/new');
  });
});
