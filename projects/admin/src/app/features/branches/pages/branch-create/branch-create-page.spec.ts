import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CreateBranchRequest } from '@bepthaymao/api-client';
import { of, Subject, throwError } from 'rxjs';
import { OwnerBranchesService } from '../../data-access/owner-branches.service';
import { branchFixture } from '../../testing/branch-fixture';
import { BranchCreatePage } from './branch-create-page';

const created = branchFixture({ id: 'new-1', name: 'Cơ sở Mới', managerIdentifier: 'quanly-moi' });
const create = vi.fn<(body: CreateBranchRequest) => unknown>();

beforeEach(() => {
  create.mockReset();
  create.mockReturnValue(of(created));
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: OwnerBranchesService, useValue: { create } }],
  });
});

function fill(page: BranchCreatePage): void {
  page.form.controls.branch.patchValue({
    name: 'Cơ sở Mới',
    address: 'Số 2 Đường Mẫu',
    phone: '0901 234 567',
    lat: '10.7769',
    lng: '106.7009',
  });
  page.form.controls.manager.patchValue({
    identifier: 'quanly-moi',
    password: 'mat-khau-dai-10',
  });
}

function mount(): ComponentFixture<BranchCreatePage> {
  const fixture = TestBed.createComponent(BranchCreatePage);
  document.body.appendChild(fixture.nativeElement as HTMLElement);
  return fixture;
}

function button(root: HTMLElement, text: string): HTMLElement {
  const found = Array.from(root.querySelectorAll<HTMLElement>('button, a')).find(
    (element) => element.textContent.trim() === text,
  );
  if (!found) throw new Error(`No button or link named "${text}"`);
  return found;
}

it('sends the exact branch and manager bodies of a valid form', () => {
  const page = mount().componentInstance;
  fill(page);
  page.submit();
  expect(create).toHaveBeenCalledExactlyOnceWith({
    branch: {
      name: 'Cơ sở Mới',
      address: 'Số 2 Đường Mẫu',
      phone: '0901234567',
      lat: 10.7769,
      lng: 106.7009,
      openTime: '06:00',
      closeTime: '21:30',
      abandonedThresholdMinutes: 10,
      zaloRecipientIds: [],
      isActive: true,
      bankCode: null,
      bankAccountNo: null,
      sepayAccountRef: null,
    },
    manager: { identifier: 'quanly-moi', password: 'mat-khau-dai-10' },
  });
});

it('replaces the form with a success heading that takes focus and shows the credentials once', async () => {
  const fixture = mount();
  fill(fixture.componentInstance);
  fixture.componentInstance.submit();
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  const heading = root.querySelector('h1');
  expect(heading?.textContent.trim()).toBe('Đã tạo cơ sở Cơ sở Mới');
  expect(document.activeElement).toBe(heading);
  expect(root.querySelector('form')).toBeNull();
  expect(root.textContent).toContain('quanly-moi');
  expect(root.textContent).toContain('mat-khau-dai-10');
  expect(root.textContent).toContain('Về danh sách cơ sở');
  fixture.destroy();
});

it('forgets the password when the screen is left and never writes it to storage', async () => {
  const fixture = mount();
  const page = fixture.componentInstance;
  fill(page);
  page.submit();
  await fixture.whenStable();
  expect(page.created()?.password).toBe('mat-khau-dai-10');
  expect(page.form.controls.manager.controls.password.value).toBe('');
  expect([localStorage.length, sessionStorage.length]).toEqual([0, 0]);
  fixture.destroy();
  expect(page.created()).toBeNull();
});

it('fills a random 16 character password and reveals it', async () => {
  const fixture = mount();
  const root = fixture.nativeElement as HTMLElement;
  await fixture.whenStable();
  button(root, 'Tạo mật khẩu ngẫu nhiên').click();
  await fixture.whenStable();
  const input = root.querySelector<HTMLInputElement>('#manager-password');
  expect(input?.value).toMatch(/^[A-HJ-NP-Za-km-z2-9]{16}$/);
  expect(input?.type).toBe('text');
  fixture.destroy();
});

it('copies the password and acknowledges it', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  const fixture = mount();
  const root = fixture.nativeElement as HTMLElement;
  fill(fixture.componentInstance);
  fixture.componentInstance.submit();
  await fixture.whenStable();
  button(root, 'Sao chép mật khẩu').click();
  await fixture.whenStable();
  expect(writeText).toHaveBeenCalledExactlyOnceWith('mat-khau-dai-10');
  expect(button(root, 'Đã sao chép')).toBeTruthy();
  fixture.destroy();
});

it('labels every field of the create form', async () => {
  const fixture = mount();
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  const labels = Array.from(root.querySelectorAll('label')).map((label) =>
    label.textContent.trim(),
  );
  expect(labels).toEqual(
    expect.arrayContaining([
      'Tên cơ sở',
      'Địa chỉ',
      'Số điện thoại',
      'Vĩ độ',
      'Kinh độ',
      'Giờ mở nhận đơn',
      'Giờ đóng nhận đơn',
      'Cảnh báo đơn bị bỏ quên sau (phút)',
      'ID Zalo người nhận tin (không bắt buộc)',
      'Mã ngân hàng (không bắt buộc)',
      'Số tài khoản (không bắt buộc)',
      'Mã tham chiếu SePay (không bắt buộc)',
      'Tên đăng nhập của quản lý',
      'Mật khẩu',
    ]),
  );
  expect(root.querySelector('h1')?.textContent.trim()).toBe('Tạo cơ sở mới');
  fixture.destroy();
});

function typeInto(root: HTMLElement, id: string, value: string): void {
  const input = root.querySelector<HTMLInputElement>(`#${id}`);
  if (!input) throw new Error(`No field #${id}`);
  input.value = value;
  input.dispatchEvent(new Event('input'));
  input.dispatchEvent(new Event('blur'));
}

function noteText(root: HTMLElement, id: string): string | undefined {
  return root.querySelector(`#${id}-note`)?.textContent.trim();
}

function submitButton(root: HTMLElement): HTMLButtonElement {
  const found = root.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (!found) throw new Error('No submit button');
  return found;
}

async function submitInvalid(
  fixture: ComponentFixture<BranchCreatePage>,
  clear: Record<string, string>,
): Promise<HTMLElement> {
  fill(fixture.componentInstance);
  fixture.componentInstance.form.controls.branch.patchValue(clear);
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  submitButton(root).click();
  await fixture.whenStable();
  return root;
}

async function submitFailing(error: HttpErrorResponse): Promise<{
  fixture: ComponentFixture<BranchCreatePage>;
  root: HTMLElement;
}> {
  create.mockReturnValue(throwError(() => error));
  const fixture = mount();
  fill(fixture.componentInstance);
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  submitButton(root).click();
  await fixture.whenStable();
  return { fixture, root };
}

it('explains the manager identifier rule and wires it with aria-describedby', async () => {
  const fixture = mount();
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  const input = root.querySelector('#manager-identifier');
  expect(input?.getAttribute('aria-describedby')).toBe('manager-identifier-note');
  expect(noteText(root, 'manager-identifier')).toBe(
    'Từ 3 đến 64 ký tự: chữ không dấu, số và . _ - @ +, không khoảng trắng.',
  );
  fixture.destroy();
});

it('rejects an accented manager identifier below the field before any request', async () => {
  const fixture = mount();
  const root = fixture.nativeElement as HTMLElement;
  fill(fixture.componentInstance);
  await fixture.whenStable();
  typeInto(root, 'manager-identifier', 'quản-lý');
  await fixture.whenStable();
  expect(noteText(root, 'manager-identifier')).toBe(
    'Tên đăng nhập chỉ gồm chữ không dấu, số và các ký tự . _ - @ +, dài 3 đến 64 ký tự.',
  );
  expect(root.querySelector('#manager-identifier')?.getAttribute('aria-invalid')).toBe('true');
  submitButton(root).click();
  await fixture.whenStable();
  expect(create).not.toHaveBeenCalled();
  expect(root.querySelector('a[href="#manager-identifier"]')).not.toBeNull();
  fixture.destroy();
});

it('shows a focused error summary with one link per invalid field', async () => {
  const fixture = mount();
  const root = await submitInvalid(fixture, { name: '', address: '', phone: '' });
  expect(create).not.toHaveBeenCalled();
  const heading = root.querySelector('h2[tabindex="-1"]');
  expect(heading?.textContent.trim()).toBe('Có 3 chỗ cần sửa');
  expect(document.activeElement).toBe(heading);
  const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('.summary a'));
  expect(links.map((link) => [link.getAttribute('href'), link.textContent.trim()])).toEqual([
    ['#branch-name', 'Nhập tên cơ sở.'],
    ['#branch-address', 'Nhập địa chỉ.'],
    ['#branch-phone', 'Nhập số điện thoại.'],
  ]);
  links[1]?.click();
  expect(document.activeElement?.id).toBe('branch-address');
  fixture.destroy();
});

it('focuses the first invalid field instead of a summary when fewer than 3 are wrong', async () => {
  const fixture = mount();
  const root = await submitInvalid(fixture, { name: '', address: '' });
  expect(root.querySelector('.summary')).toBeNull();
  expect(document.activeElement?.id).toBe('branch-name');
  fixture.destroy();
});

it('maps server validation keys onto the matching field', async () => {
  const body = { errors: { 'branch.openTime': ['Giờ mở không hợp lệ.'] }, correlationId: 'c-400' };
  const { fixture, root } = await submitFailing(
    new HttpErrorResponse({ status: 400, error: body }),
  );
  expect(noteText(root, 'branch-open')).toBe('Giờ mở không hợp lệ.');
  expect(root.querySelector('#branch-open')?.getAttribute('aria-invalid')).toBe('true');
  fixture.destroy();
});

it('reports a duplicate manager identifier (409) under the identifier field', async () => {
  const { fixture, root } = await submitFailing(new HttpErrorResponse({ status: 409, error: {} }));
  expect(noteText(root, 'manager-identifier')).toBe(
    'Tên đăng nhập này đã có người dùng. Chọn tên khác.',
  );
  fixture.destroy();
});

it('keeps typed data and shows a banner with the correlation id on a server failure', async () => {
  const error = new HttpErrorResponse({
    status: 500,
    error: { detail: 'private-detail', correlationId: 'c-500' },
  });
  const { fixture, root } = await submitFailing(error);
  const banner = root.querySelector('[role="alert"]');
  expect(banner?.textContent).toContain('Máy chủ gặp lỗi.');
  expect(banner?.textContent).toContain('c-500');
  expect(banner?.textContent).not.toContain('private-detail');
  expect(root.querySelector<HTMLInputElement>('#branch-name')?.value).toBe('Cơ sở Mới');
  expect(submitButton(root).disabled).toBe(false);
  fixture.destroy();
});

it('disables the submit button only while sending and relabels it after 300ms', () => {
  vi.useFakeTimers();
  try {
    const pending = new Subject<unknown>();
    create.mockReturnValue(pending);
    const fixture = mount();
    const root = fixture.nativeElement as HTMLElement;
    fill(fixture.componentInstance);
    fixture.detectChanges();
    expect(submitButton(root).disabled).toBe(false);
    fixture.componentInstance.submit();
    fixture.detectChanges();
    expect(submitButton(root).disabled).toBe(true);
    expect(submitButton(root).textContent).not.toContain('Đang tạo cơ sở…');
    vi.advanceTimersByTime(301);
    fixture.detectChanges();
    expect(submitButton(root).textContent).toContain('Đang tạo cơ sở…');
    pending.error(new HttpErrorResponse({ status: 500, error: {} }));
    fixture.detectChanges();
    expect(submitButton(root).disabled).toBe(false);
    fixture.destroy();
  } finally {
    vi.useRealTimers();
  }
});
