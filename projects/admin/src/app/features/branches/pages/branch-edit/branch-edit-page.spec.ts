import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { BranchOwnerSettingsRequest } from '@bepthaymao/api-client';
import { of, Subject, throwError } from 'rxjs';
import { ConfirmDialog, ConfirmOptions } from '../../../../shared/dialog/confirm-dialog';
import { OwnerBranchesService } from '../../data-access/owner-branches.service';
import { branchFixture } from '../../testing/branch-fixture';
import { BranchEditPage } from './branch-edit-page';

const saved = branchFixture({
  id: 'b-1',
  name: 'Cơ sở Mẫu 1',
  bankCode: 'VCB',
  bankAccountNo: '0123456789',
  zaloRecipientIds: ['zalo-1'],
});

const get = vi.fn<(id: string) => unknown>();
const update = vi.fn<(id: string, body: BranchOwnerSettingsRequest) => unknown>();
const confirm = vi.fn<(options: ConfirmOptions) => Promise<boolean>>();
const navigateByUrl = vi.fn<Router['navigateByUrl']>();

beforeEach(() => {
  get.mockReset();
  update.mockReset();
  confirm.mockReset();
  navigateByUrl.mockReset();
  navigateByUrl.mockResolvedValue(true);
  get.mockReturnValue(of(saved));
  update.mockImplementation((_id, body) => of({ ...saved, ...body }));
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: OwnerBranchesService, useValue: { get, update } },
      { provide: ConfirmDialog, useValue: { confirm } },
      { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: 'b-1' })) } },
    ],
  });
  vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockImplementation(navigateByUrl);
});

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

async function mount(): Promise<ComponentFixture<BranchEditPage>> {
  const fixture = TestBed.createComponent(BranchEditPage);
  document.body.appendChild(fixture.nativeElement as HTMLElement);
  await fixture.whenStable();
  return fixture;
}

function root(fixture: ComponentFixture<BranchEditPage>): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

function find(fixture: ComponentFixture<BranchEditPage>, text: string): HTMLElement {
  const found = Array.from(root(fixture).querySelectorAll<HTMLElement>('button, a')).find(
    (element) => element.textContent.trim() === text,
  );
  if (!found) throw new Error(`No button or link named "${text}"`);
  return found;
}

const savedBody = {
  name: 'Cơ sở Mẫu 1',
  address: 'Số 1 Đường Mẫu',
  phone: '0901234567',
  lat: 10.7769,
  lng: 106.7009,
  openTime: '06:00',
  closeTime: '21:30',
  abandonedThresholdMinutes: 10,
  zaloRecipientIds: ['zalo-1'],
  isActive: true,
  bankCode: 'VCB',
  bankAccountNo: '0123456789',
  sepayAccountRef: null,
};

describe('loading', () => {
  it('loads the branch by the route id into the heading, tab title and form', async () => {
    const fixture = await mount();
    expect(get).toHaveBeenCalledExactlyOnceWith('b-1');
    expect(root(fixture).querySelector('h1')?.textContent.trim()).toBe('Cơ sở Mẫu 1');
    expect(document.title).toBe('Cơ sở Mẫu 1 | Quản trị Bếp Thầy Mão');
    expect(fixture.componentInstance.form.getRawValue()).toEqual({
      name: 'Cơ sở Mẫu 1',
      address: 'Số 1 Đường Mẫu',
      phone: '0901234567',
      lat: '10.7769',
      lng: '106.7009',
      openTime: '06:00',
      closeTime: '21:30',
      threshold: '10',
      zaloIds: 'zalo-1',
      bankCode: 'VCB',
      bankAccountNo: '0123456789',
      sepayAccountRef: '',
    });
    expect(root(fixture).querySelector('#manager-identifier')).toBeNull();
    expect(root(fixture).querySelector('#manager-password')).toBeNull();
  });

  it('shows "Không tìm thấy cơ sở này" with a way back on 404', async () => {
    get.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
    const fixture = await mount();
    expect(root(fixture).querySelector('h1')?.textContent.trim()).toBe('Không tìm thấy cơ sở này');
    expect(root(fixture).textContent).toContain(
      'Đường dẫn có thể sai, hoặc cơ sở không thuộc tài khoản của bạn.',
    );
    expect(find(fixture, 'Về danh sách cơ sở').getAttribute('href')).toBe('/owner/branches');
    expect(root(fixture).querySelector('form')).toBeNull();
  });

  it('sends a 403 to the forbidden page', async () => {
    get.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 403 })));
    await mount();
    expect(navigateByUrl).toHaveBeenCalledWith('/forbidden');
  });

  it('shows a banner and a retry on a server error, then loads on retry', async () => {
    get.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 500 })));
    const fixture = await mount();
    expect(root(fixture).querySelector('[role="alert"]')?.textContent).toContain(
      'Máy chủ gặp lỗi. Hãy thử lại sau ít phút.',
    );
    find(fixture, 'Thử lại').click();
    await fixture.whenStable();
    expect(get).toHaveBeenCalledTimes(2);
    expect(root(fixture).querySelector('h1')?.textContent.trim()).toBe('Cơ sở Mẫu 1');
  });
});

describe('saving', () => {
  it('sends the form values with the saved active state and announces the saved time', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-12T13:05:00Z'));
    const fixture = await mount();
    const page = fixture.componentInstance;
    page.form.controls.closeTime.setValue('20:00');
    expect(page.hasUnsavedChanges()).toBe(true);
    page.submit();
    await fixture.whenStable();
    expect(update).toHaveBeenCalledExactlyOnceWith('b-1', { ...savedBody, closeTime: '20:00' });
    expect(root(fixture).querySelector('[role="status"].saved')?.textContent.trim()).toBe(
      'Đã lưu lúc 20:05.',
    );
    expect(page.hasUnsavedChanges()).toBe(false);
  });
});

describe('saving failures', () => {
  it('keeps what was typed and shows a banner when saving fails', async () => {
    update.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 503 })));
    const fixture = await mount();
    const page = fixture.componentInstance;
    page.form.controls.name.setValue('Tên đang sửa');
    page.submit();
    await fixture.whenStable();
    expect(page.form.controls.name.value).toBe('Tên đang sửa');
    expect(root(fixture).querySelector('[role="alert"]')).not.toBeNull();
    expect(page.hasUnsavedChanges()).toBe(true);
  });

  it('puts a flat server validation message under its field', async () => {
    update.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { errors: { lat: ['Vĩ độ không hợp lệ.'] } },
          }),
      ),
    );
    const fixture = await mount();
    fixture.componentInstance.submit();
    await fixture.whenStable();
    expect(fixture.componentInstance.form.controls.lat.errors).toEqual({
      server: 'Vĩ độ không hợp lệ.',
    });
  });

  it('blocks an invalid form with the error summary and no request', async () => {
    const fixture = await mount();
    fixture.componentInstance.form.controls.name.setValue('');
    fixture.componentInstance.submit();
    await fixture.whenStable();
    expect(update).not.toHaveBeenCalled();
    expect(root(fixture).querySelector('#error-summary-title')?.textContent).toContain(
      'chỗ cần sửa',
    );
  });

  it('shows "Đang lưu…" only after 300 ms', async () => {
    vi.useFakeTimers();
    const pending = new Subject<unknown>();
    update.mockReturnValue(pending);
    const fixture = TestBed.createComponent(BranchEditPage);
    document.body.appendChild(fixture.nativeElement as HTMLElement);
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(0);
    fixture.componentInstance.submit();
    fixture.detectChanges();
    expect(root(fixture).textContent).not.toContain('Đang lưu…');
    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();
    expect(root(fixture).textContent).toContain('Đang lưu…');
    pending.next(saved);
    pending.complete();
    fixture.detectChanges();
    expect(root(fixture).textContent).not.toContain('Đang lưu…');
  });
});

describe('turning orders off and on', () => {
  it('shows the status line and the matching button', async () => {
    const fixture = await mount();
    expect(root(fixture).querySelector('[role="status"].order-status')?.textContent.trim()).toBe(
      'Cơ sở đang nhận đơn.',
    );
    expect(find(fixture, 'Tắt nhận đơn')).toBeTruthy();
  });

  it('asks first and does nothing when the user keeps the branch as it is', async () => {
    confirm.mockResolvedValue(false);
    const fixture = await mount();
    await fixture.componentInstance.toggleActive();
    expect(confirm).toHaveBeenCalledExactlyOnceWith({
      title: 'Tắt nhận đơn cơ sở Cơ sở Mẫu 1?',
      body: 'Cơ sở sẽ không được gán đơn mới cho tới khi bạn bật lại.',
      confirmLabel: 'Tắt nhận đơn',
      cancelLabel: 'Giữ nguyên',
      danger: true,
    });
    expect(update).not.toHaveBeenCalled();
  });
});

describe('turning orders off with an unsaved edit', () => {
  it('turning off sends the last saved values, not the unsaved edit, and keeps the edit in the form', async () => {
    confirm.mockResolvedValue(true);
    const fixture = await mount();
    const page = fixture.componentInstance;
    page.form.controls.name.setValue('Sửa chưa lưu');
    page.form.controls.closeTime.setValue('19:00');
    await page.toggleActive();
    await fixture.whenStable();
    expect(update).toHaveBeenCalledExactlyOnceWith('b-1', { ...savedBody, isActive: false });
    expect(page.form.controls.name.value).toBe('Sửa chưa lưu');
    expect(page.form.controls.closeTime.value).toBe('19:00');
    expect(page.hasUnsavedChanges()).toBe(true);
    expect(root(fixture).querySelector('.order-status')?.textContent.trim()).toBe(
      'Cơ sở đã tắt nhận đơn.',
    );
    expect(find(fixture, 'Bật nhận đơn')).toBeTruthy();
  });

  it('turning on runs at once without asking and sends the saved values with isActive true', async () => {
    get.mockReturnValue(of({ ...saved, isActive: false }));
    const fixture = await mount();
    await fixture.componentInstance.toggleActive();
    await fixture.whenStable();
    expect(confirm).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledExactlyOnceWith('b-1', { ...savedBody, isActive: true });
    expect(root(fixture).querySelector('.order-status')?.textContent.trim()).toBe(
      'Cơ sở đang nhận đơn.',
    );
  });

  it('shows a banner and keeps the old state when the change fails', async () => {
    confirm.mockResolvedValue(true);
    update.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    const fixture = await mount();
    await fixture.componentInstance.toggleActive();
    await fixture.whenStable();
    expect(root(fixture).querySelector('[role="alert"]')).not.toBeNull();
    expect(root(fixture).querySelector('.order-status')?.textContent.trim()).toBe(
      'Cơ sở đang nhận đơn.',
    );
  });
});
