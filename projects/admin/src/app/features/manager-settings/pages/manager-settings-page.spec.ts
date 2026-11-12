import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BranchSettingsRequest, ManagerBranchView } from '@bepthaymao/api-client';
import { of, Subject, throwError } from 'rxjs';
import { ManagerSettingsService } from '../data-access/manager-settings.service';
import { ManagerSettingsPage } from './manager-settings-page';

const view: ManagerBranchView = {
  phone: '0901234567',
  openTime: '06:00',
  closeTime: '21:30',
  abandonedThresholdMinutes: 10,
  zaloRecipientIds: ['zalo-1', 'zalo-2'],
  name: 'Cơ sở Mẫu 1',
  address: 'Số 1 Đường Mẫu',
  isActive: true,
  bankAccountNo: null,
  bankCode: 'VCB',
  sepayAccountRef: null,
};

const get = vi.fn<() => unknown>();
const update = vi.fn<(body: BranchSettingsRequest) => unknown>();
const navigateByUrl = vi.fn<(url: string) => Promise<boolean>>();

beforeEach(() => {
  get.mockReset();
  update.mockReset();
  navigateByUrl.mockReset();
  navigateByUrl.mockResolvedValue(true);
  get.mockReturnValue(of(view));
  update.mockReturnValue(of(view));
  TestBed.configureTestingModule({
    providers: [
      { provide: ManagerSettingsService, useValue: { get, update } },
      { provide: Router, useValue: { navigateByUrl } },
    ],
  });
});

async function mount(): Promise<ComponentFixture<ManagerSettingsPage>> {
  const fixture = TestBed.createComponent(ManagerSettingsPage);
  document.body.appendChild(fixture.nativeElement as HTMLElement);
  await fixture.whenStable();
  return fixture;
}

function root(fixture: ComponentFixture<ManagerSettingsPage>): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

function press(fixture: ComponentFixture<ManagerSettingsPage>, text: string): void {
  const found = Array.from(root(fixture).querySelectorAll<HTMLElement>('button')).find(
    (element) => element.textContent.trim() === text,
  );
  if (!found) throw new Error(`No button named "${text}"`);
  found.click();
}

function wellRows(fixture: ComponentFixture<ManagerSettingsPage>): [string, string][] {
  return Array.from(root(fixture).querySelectorAll('dl dt')).map((dt) => [
    dt.textContent.trim(),
    dt.nextElementSibling?.textContent.trim() ?? '',
  ]);
}

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

it('loads the own-branch settings into the form under the page heading', async () => {
  const fixture = await mount();
  const page = fixture.componentInstance;
  expect(get).toHaveBeenCalledOnce();
  expect(root(fixture).querySelector('h1')?.textContent.trim()).toBe('Thông số cơ sở');
  expect(page.form.getRawValue()).toEqual({
    phone: '0901234567',
    openTime: '06:00',
    closeTime: '21:30',
    threshold: '10',
    zaloIds: 'zalo-1\nzalo-2',
  });
  expect(root(fixture).querySelector<HTMLInputElement>('#settings-phone')?.value).toBe(
    '0901234567',
  );
  expect(
    Array.from(root(fixture).querySelectorAll('h2')).map((heading) => heading.textContent.trim()),
  ).toEqual(['Nhận đơn', 'Người nhận tin Zalo', 'Do chủ sở hữu quản lý']);
});

it('shows the owner-managed fields as a read-only list with "Chưa có" for empty values', async () => {
  const fixture = await mount();
  expect(wellRows(fixture)).toEqual([
    ['Tên cơ sở', 'Cơ sở Mẫu 1'],
    ['Địa chỉ', 'Số 1 Đường Mẫu'],
    ['Trạng thái nhận đơn', 'Đang nhận đơn'],
    ['Mã ngân hàng', 'VCB'],
    ['Số tài khoản', 'Chưa có'],
    ['Mã tham chiếu SePay', 'Chưa có'],
  ]);
  expect(root(fixture).textContent).toContain(
    'Muốn đổi các thông tin này, hãy liên hệ chủ sở hữu.',
  );
});

it('has no input for any owner-managed field', async () => {
  const fixture = await mount();
  const ids = Array.from(root(fixture).querySelectorAll('input, textarea, select')).map(
    (element) => element.id,
  );
  expect(ids.sort()).toEqual(
    [
      'settings-close',
      'settings-open',
      'settings-phone',
      'settings-threshold',
      'settings-zalo',
    ].sort(),
  );
  expect(root(fixture).querySelector('dl input, dl textarea')).toBeNull();
});

it('saves exactly the five editable keys and announces the saved time in Ho Chi Minh time', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-12T13:05:00Z'));
  const fixture = await mount();
  const page = fixture.componentInstance;
  page.form.patchValue({ closeTime: '20:00', zaloIds: 'zalo-9\n\n zalo-8 ' });
  page.submit();
  await fixture.whenStable();
  expect(update).toHaveBeenCalledExactlyOnceWith({
    phone: '0901234567',
    openTime: '06:00',
    closeTime: '20:00',
    abandonedThresholdMinutes: 10,
    zaloRecipientIds: ['zalo-9', 'zalo-8'],
  });
  const status = root(fixture).querySelector('[role="status"].saved');
  expect(status?.textContent.trim()).toBe('Đã lưu lúc 20:05.');
});

it('clears the saved time at the next edit', async () => {
  const fixture = await mount();
  const page = fixture.componentInstance;
  page.submit();
  await fixture.whenStable();
  expect(root(fixture).querySelector('.saved')?.textContent.trim()).toMatch(
    /^Đã lưu lúc \d\d:\d\d\.$/,
  );
  page.form.controls.phone.setValue('0909999999');
  await fixture.whenStable();
  expect(root(fixture).querySelector('.saved')?.textContent.trim() ?? '').toBe('');
});

it('blocks a close time that is not after the open time and lists the problem', async () => {
  const fixture = await mount();
  const page = fixture.componentInstance;
  page.form.patchValue({ openTime: '20:00', closeTime: '20:00' });
  page.submit();
  await fixture.whenStable();
  expect(update).not.toHaveBeenCalled();
  expect(root(fixture).textContent).toContain('Giờ đóng phải sau giờ mở trong cùng một ngày.');
  expect(root(fixture).querySelector('#error-summary-title')?.textContent).toContain('chỗ cần sửa');
});

it('puts a server validation message under its field and keeps what was typed', async () => {
  update.mockReturnValue(
    throwError(
      () =>
        new HttpErrorResponse({
          status: 400,
          error: { errors: { openTime: ['Giờ mở không hợp lệ.'] }, correlationId: 'c-1' },
        }),
    ),
  );
  const fixture = await mount();
  const page = fixture.componentInstance;
  page.form.patchValue({ zaloIds: 'zalo-keep' });
  page.submit();
  await fixture.whenStable();
  expect(page.form.controls.openTime.errors).toEqual({ server: 'Giờ mở không hợp lệ.' });
  expect(page.form.controls.zaloIds.value).toBe('zalo-keep');
  expect(root(fixture).querySelector('#settings-open-note')?.textContent).toContain(
    'Giờ mở không hợp lệ.',
  );
});

it('shows a banner with a retry when loading fails and reloads on retry', async () => {
  get.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 503 })));
  const fixture = await mount();
  expect(root(fixture).querySelector('[role="alert"]')?.textContent).toContain(
    'Máy chủ gặp lỗi. Hãy thử lại sau ít phút.',
  );
  expect(root(fixture).querySelector('form')).toBeNull();
  press(fixture, 'Thử lại');
  await fixture.whenStable();
  expect(get).toHaveBeenCalledTimes(2);
  expect(root(fixture).querySelector('form')).not.toBeNull();
});

it('sends a 403 on load to the forbidden page', async () => {
  get.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 403 })));
  await mount();
  expect(navigateByUrl).toHaveBeenCalledWith('/forbidden');
});

it('shows the label "Đang lưu…" only after 300 ms of waiting', async () => {
  vi.useFakeTimers();
  const pending = new Subject<ManagerBranchView>();
  update.mockReturnValue(pending);
  const fixture = TestBed.createComponent(ManagerSettingsPage);
  document.body.appendChild(fixture.nativeElement as HTMLElement);
  fixture.detectChanges();
  await vi.advanceTimersByTimeAsync(0);
  fixture.componentInstance.submit();
  fixture.detectChanges();
  expect(root(fixture).textContent).not.toContain('Đang lưu…');
  await vi.advanceTimersByTimeAsync(300);
  fixture.detectChanges();
  expect(root(fixture).textContent).toContain('Đang lưu…');
  pending.next(view);
  pending.complete();
  fixture.detectChanges();
  expect(root(fixture).textContent).not.toContain('Đang lưu…');
});
