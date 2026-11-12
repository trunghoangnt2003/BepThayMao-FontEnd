import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CreateBranchRequest } from '@bepthaymao/api-client';
import { of } from 'rxjs';
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
