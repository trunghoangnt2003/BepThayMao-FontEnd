import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { BranchOptionDto } from '@bepthaymao/api-client';
import { provideCore } from '@bepthaymao/core';
import { CartStore } from '../data-access/shop-data';
import { CheckoutPage } from './checkout-page';

const option: BranchOptionDto = {
  branchId: 'b1',
  distanceKm: null,
  name: 'Cơ sở Mẫu 1',
  address: 'Số 1',
  openTime: '06:00',
  closeTime: '21:30',
  isOpenNow: true,
  nextDayWarning: false,
  isSuggested: true,
  acceptsOrders: true,
  unavailableDishIds: [],
};

function setup(): void {
  sessionStorage.clear();
  TestBed.configureTestingModule({
    providers: [provideCore(), provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
  });
  TestBed.inject(CartStore).set({ id: 'd1', name: 'Xôi xéo', price: 25000, category: 'XoiMan' }, 2);
}

function find(root: HTMLElement, selector: string): HTMLElement {
  const element = root.querySelector<HTMLElement>(selector);
  if (!element) throw new Error(`Không thấy ${selector}`);
  return element;
}

function input(root: HTMLElement, selector: string): HTMLInputElement {
  const element = root.querySelector<HTMLInputElement>(selector);
  if (!element) throw new Error(`Không thấy ${selector}`);
  return element;
}

function buttonWith(root: HTMLElement, text: string): HTMLButtonElement {
  const button = Array.from(root.querySelectorAll('button')).find((item) =>
    item.textContent.includes(text),
  );
  if (!button) throw new Error(`Không thấy nút ${text}`);
  return button;
}

async function render(options: readonly BranchOptionDto[] = [option]) {
  const fixture = TestBed.createComponent(CheckoutPage);
  await fixture.whenStable();
  TestBed.inject(HttpTestingController)
    .match((request) => request.url.endsWith('/checkout/branch-options'))
    .forEach((request) => {
      request.flush(options);
    });
  await fixture.whenStable();
  const html = fixture.nativeElement as HTMLElement;
  const next = async () => {
    find(html, 'button[type="submit"]').click();
    await fixture.whenStable();
  };
  const heading = () => find(html, 'h1').textContent.trim();
  const fillRecipient = () => {
    for (const [id, value] of [
      ['f-name', 'Lan'],
      ['f-phone', '0901 234 567'],
      ['f-address', '2 Đường Thử'],
    ] as const) {
      const field = input(html, '#' + id);
      field.value = value;
      field.dispatchEvent(new Event('input'));
    }
  };
  return { fixture, html, next, heading, fillRecipient };
}

async function toBranchStep(options?: readonly BranchOptionDto[]) {
  const view = await render(options);
  await view.next();
  view.fillRecipient();
  await view.next();
  return view;
}

describe('CheckoutPage steps', () => {
  beforeEach(setup);

  it('moves forward one step at a time and blocks a step with missing recipient fields', async () => {
    const { html, next, heading } = await render();
    expect(heading()).toBe('Giỏ hàng');
    await next();
    expect(heading()).toBe('Người nhận');
    await next();
    expect(heading()).toBe('Người nhận');
    expect(find(html, '[role="alert"]').textContent).toContain('Nhập họ và tên.');
    expect(find(html, '[role="alert"]').textContent).not.toContain('Chọn một cơ sở');
  });

  it('reaches the review step with valid data and can jump back to an earlier step', async () => {
    const view = await toBranchStep();
    expect(view.heading()).toBe('Chọn cơ sở');
    await view.next();
    expect(view.heading()).toBe('Xem lại và thanh toán');
    expect(view.html.textContent).toContain('Lan, 0901 234 567, 2 Đường Thử');
    expect(view.html.textContent).toContain('Cơ sở Mẫu 1');
    Array.from(view.html.querySelectorAll<HTMLButtonElement>('button.edit'))[1]?.click();
    await view.fixture.whenStable();
    expect(view.heading()).toBe('Người nhận');
  });

  it('goes back to the menu from the first step and reports a missing location', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const view = await render();
    buttonWith(view.html, 'Thêm món').click();
    expect(navigate).toHaveBeenCalledWith(['/thuc-don']);
    await view.next();
    view.fillRecipient();
    await view.next();
    find(view.html, '.locate').click();
    await view.fixture.whenStable();
    expect(view.html.textContent).toContain('Không lấy được vị trí');
    buttonWith(view.html, 'Quay lại').click();
    await view.fixture.whenStable();
    expect(view.heading()).toBe('Người nhận');
  });
});

describe('CheckoutPage sending', () => {
  beforeEach(setup);

  it('sends the order on the last step and opens the tracking page', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const view = await toBranchStep();
    await view.next();
    await view.next();
    const request = TestBed.inject(HttpTestingController).expectOne(
      (req) => req.method === 'POST' && req.url.endsWith('/orders'),
    );
    expect(request.request.body).toMatchObject({
      customerName: 'Lan',
      customerPhone: '0901234567',
      branchId: 'b1',
      items: [{ dishId: 'd1', quantity: 2 }],
    });
    request.flush({ order: { code: 'BTM123456' }, payment: null });
    expect(navigate).toHaveBeenCalledWith(['/don', 'BTM123456']);
    expect(TestBed.inject(CartStore).count()).toBe(0);
  });

  it('returns to the branch step when the server says a dish ran out', async () => {
    const view = await toBranchStep();
    await view.next();
    await view.next();
    TestBed.inject(HttpTestingController)
      .expectOne((req) => req.method === 'POST')
      .flush(
        { title: 'Món đang hết', status: 409, unavailableDishIds: ['d1'] },
        { status: 409, statusText: 'Conflict' },
      );
    await view.fixture.whenStable();
    expect(view.heading()).toBe('Chọn cơ sở');
    expect(view.html.textContent).toContain('đang hết Xôi xéo');
    find(view.html, '#drop-missing').click();
    expect(TestBed.inject(CartStore).count()).toBe(0);
  });

  it('asks to accept next-day delivery when the branch is closed', async () => {
    const view = await toBranchStep([{ ...option, isOpenNow: false }]);
    await view.next();
    expect(find(view.html, '[role="alert"]').textContent).toContain('ngày hôm sau');
    input(view.html, '#f-ack').click();
    await view.fixture.whenStable();
    await view.next();
    expect(view.heading()).toBe('Xem lại và thanh toán');
    expect(view.html.textContent).toContain('Giao vào ngày hôm sau');
  });
});
