import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { BranchResponse } from '@bepthaymao/api-client';
import { OwnerBranchesService } from '../../data-access/owner-branches.service';
import { branchFixture } from '../../testing/branch-fixture';
import { BranchListPage } from './branch-list-page';

let responses: Subject<BranchResponse[]>;
beforeEach(() => {
  responses = new Subject<BranchResponse[]>();
  TestBed.configureTestingModule({
    providers: [{ provide: OwnerBranchesService, useValue: { list: () => responses } }],
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
