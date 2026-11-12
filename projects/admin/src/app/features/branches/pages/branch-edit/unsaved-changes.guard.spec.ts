import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ConfirmDialog, ConfirmOptions } from '../../../../shared/dialog/confirm-dialog';
import { HasUnsavedChanges, unsavedChangesGuard } from './unsaved-changes.guard';

const confirm = vi.fn<(options: ConfirmOptions) => Promise<boolean>>();

beforeEach(() => {
  confirm.mockReset();
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: ConfirmDialog, useValue: { confirm } }],
  });
});

function leave(page: HasUnsavedChanges): unknown {
  const state = TestBed.inject(Router).routerState.snapshot;
  return TestBed.runInInjectionContext(() => unsavedChangesGuard(page, state.root, state, state));
}

it('lets the user leave without asking when nothing is unsaved', () => {
  expect(leave({ hasUnsavedChanges: () => false })).toBe(true);
  expect(confirm).not.toHaveBeenCalled();
});

it('asks "Rời trang này?" with "Ở lại" as the cancel choice when changes are unsaved', async () => {
  confirm.mockResolvedValue(false);
  expect(await leave({ hasUnsavedChanges: () => true })).toBe(false);
  expect(confirm).toHaveBeenCalledExactlyOnceWith({
    title: 'Rời trang này?',
    body: 'Bạn có thay đổi chưa lưu. Rời trang sẽ mất các thay đổi này.',
    confirmLabel: 'Rời trang',
    cancelLabel: 'Ở lại',
  });
});

it('leaves when the user chooses "Rời trang"', async () => {
  confirm.mockResolvedValue(true);
  expect(await leave({ hasUnsavedChanges: () => true })).toBe(true);
});
