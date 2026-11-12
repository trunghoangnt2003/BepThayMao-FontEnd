import { HttpErrorResponse } from '@angular/common/http';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { of, Subject, throwError } from 'rxjs';
import { OwnerBranchesService } from '../../data-access/owner-branches.service';
import { ResetPasswordDialog } from './reset-password-dialog';

const resetPassword = vi.fn<(id: string, password: string) => unknown>();
const close = vi.fn<(result?: unknown) => void>();
const writeText = vi.fn<(text: string) => Promise<void>>();

beforeEach(() => {
  resetPassword.mockReset();
  close.mockReset();
  writeText.mockReset();
  resetPassword.mockReturnValue(of(undefined));
  writeText.mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  TestBed.configureTestingModule({
    providers: [
      { provide: OwnerBranchesService, useValue: { resetPassword } },
      { provide: DIALOG_DATA, useValue: { branchId: 'b-1', branchName: 'Cơ sở Mẫu 1', close } },
      {
        provide: BrnDialogRef,
        useValue: { dialogId: 1, registerDescription: vi.fn(), unregisterDescription: vi.fn() },
      },
    ],
  });
});

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

async function mount(): Promise<ComponentFixture<ResetPasswordDialog>> {
  const fixture = TestBed.createComponent(ResetPasswordDialog);
  document.body.appendChild(fixture.nativeElement as HTMLElement);
  await fixture.whenStable();
  return fixture;
}

function root(fixture: ComponentFixture<ResetPasswordDialog>): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

function field(fixture: ComponentFixture<ResetPasswordDialog>): HTMLInputElement {
  const input = root(fixture).querySelector<HTMLInputElement>('input');
  if (!input) throw new Error('No password field');
  return input;
}

function type(fixture: ComponentFixture<ResetPasswordDialog>, value: string): void {
  const input = field(fixture);
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('blur'));
}

function press(fixture: ComponentFixture<ResetPasswordDialog>, text: string): void {
  const found = Array.from(root(fixture).querySelectorAll<HTMLElement>('button')).find(
    (element) => element.textContent.trim() === text,
  );
  if (!found) throw new Error(`No button named "${text}"`);
  found.click();
}

function submit(fixture: ComponentFixture<ResetPasswordDialog>): void {
  root(fixture)
    .querySelector('form')
    ?.dispatchEvent(new Event('submit', { cancelable: true }));
}

describe('phase one: choose a new password', () => {
  it('names the action, the branch and the field, and puts the safe choice first', async () => {
    const fixture = await mount();
    expect(root(fixture).querySelector('h2')?.textContent.trim()).toBe('Đặt lại mật khẩu quản lý');
    expect(root(fixture).textContent).toContain(
      'Quản lý cơ sở Cơ sở Mẫu 1 sẽ dùng mật khẩu mới. Mật khẩu cũ không còn dùng được.',
    );
    expect(root(fixture).querySelector('label')?.textContent.trim()).toBe('Mật khẩu mới');
    expect(field(fixture).hasAttribute('data-autofocus')).toBe(true);
    const actions = Array.from(root(fixture).querySelectorAll('.hlm-dialog__actions button')).map(
      (button) => button.textContent.trim(),
    );
    expect(actions).toEqual(['Không đặt lại', 'Đặt lại mật khẩu']);
  });

  it('fills a random 16 character password and shows it', async () => {
    const fixture = await mount();
    press(fixture, 'Tạo mật khẩu ngẫu nhiên');
    await fixture.whenStable();
    expect(field(fixture).value).toMatch(/^[A-Za-z0-9]{16}$/);
    expect(field(fixture).type).toBe('text');
  });

  it('refuses a 9 character password and says why without calling the API', async () => {
    const fixture = await mount();
    type(fixture, 'chinchinch');
    type(fixture, '123456789');
    submit(fixture);
    await fixture.whenStable();
    expect(resetPassword).not.toHaveBeenCalled();
    expect(root(fixture).textContent).toContain('Mật khẩu cần ít nhất 10 ký tự.');
    expect(field(fixture).getAttribute('aria-invalid')).toBe('true');
  });

  it('closes on "Không đặt lại" without calling the API', async () => {
    const fixture = await mount();
    type(fixture, 'mat-khau-moi-10');
    press(fixture, 'Không đặt lại');
    expect(close).toHaveBeenCalledOnce();
    expect(resetPassword).not.toHaveBeenCalled();
  });
});

describe('phase one: the server answers', () => {
  it('shows the server message under the field when the password is rejected', async () => {
    resetPassword.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { errors: { newPassword: ['Mật khẩu quá yếu.'] } },
          }),
      ),
    );
    const fixture = await mount();
    type(fixture, 'mat-khau-moi-10');
    submit(fixture);
    await fixture.whenStable();
    expect(root(fixture).textContent).toContain('Mật khẩu quá yếu.');
    expect(root(fixture).querySelector('h2')?.textContent.trim()).toBe('Đặt lại mật khẩu quản lý');
  });

  it('shows a banner with fixed text on a server failure and stays in phase one', async () => {
    resetPassword.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    const fixture = await mount();
    type(fixture, 'mat-khau-moi-10');
    submit(fixture);
    await fixture.whenStable();
    expect(root(fixture).querySelector('[role="alert"]')?.textContent).toContain(
      'Máy chủ gặp lỗi. Hãy thử lại sau ít phút.',
    );
    expect(root(fixture).querySelector('h2')?.textContent.trim()).toBe('Đặt lại mật khẩu quản lý');
  });

  it('shows "Đang đặt lại…" only after 300 ms of waiting', async () => {
    vi.useFakeTimers();
    const pending = new Subject<void>();
    resetPassword.mockReturnValue(pending);
    const fixture = TestBed.createComponent(ResetPasswordDialog);
    document.body.appendChild(fixture.nativeElement as HTMLElement);
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(0);
    type(fixture, 'mat-khau-moi-10');
    submit(fixture);
    fixture.detectChanges();
    expect(root(fixture).textContent).not.toContain('Đang đặt lại…');
    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();
    expect(root(fixture).textContent).toContain('Đang đặt lại…');
    pending.next();
    pending.complete();
  });
});

describe('phase two: the password is shown once', () => {
  async function reset(): Promise<ComponentFixture<ResetPasswordDialog>> {
    const fixture = await mount();
    type(fixture, 'mat-khau-moi-10');
    submit(fixture);
    await fixture.whenStable();
    return fixture;
  }

  it('sends the branch id and the password, then shows the result with copy and close', async () => {
    const fixture = await reset();
    expect(resetPassword).toHaveBeenCalledExactlyOnceWith('b-1', 'mat-khau-moi-10');
    expect(root(fixture).querySelector('h2')?.textContent.trim()).toBe('Đã đặt lại mật khẩu');
    expect(root(fixture).textContent).toContain(
      'Mật khẩu mới chỉ hiện một lần. Hãy sao chép và gửi cho quản lý ngay.',
    );
    expect(root(fixture).textContent).toContain('mat-khau-moi-10');
    expect(root(fixture).querySelector('input')).toBeNull();
    expect(
      Array.from(root(fixture).querySelectorAll('.hlm-dialog__actions button')).map((button) =>
        button.textContent.trim(),
      ),
    ).toEqual(['Sao chép mật khẩu', 'Đóng']);
  });

  it('copies the password and says so', async () => {
    const fixture = await reset();
    press(fixture, 'Sao chép mật khẩu');
    await fixture.whenStable();
    expect(writeText).toHaveBeenCalledExactlyOnceWith('mat-khau-moi-10');
    expect(root(fixture).textContent).toContain('Đã sao chép');
  });

  it('forgets the password from the signal and the screen when it is closed', async () => {
    const fixture = await reset();
    expect(fixture.componentInstance.issued()).toBe('mat-khau-moi-10');
    press(fixture, 'Đóng');
    await fixture.whenStable();
    expect(fixture.componentInstance.issued()).toBeNull();
    expect(root(fixture).textContent).not.toContain('mat-khau-moi-10');
    expect(close).toHaveBeenCalledOnce();
  });

  it('forgets the password when the dialog is destroyed by Escape or the scrim', async () => {
    const fixture = await reset();
    fixture.destroy();
    expect(fixture.componentInstance.issued()).toBeNull();
  });

  it('never writes the password to storage', async () => {
    await reset();
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });
});
