import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AccessTokenStore, provideCore } from '@bepthaymao/core';
import { LegalPage } from './legal-page';

const kinds = ['Terms', 'Privacy', 'Delivery', 'Payment', 'Refund', 'Complaint'] as const;

function legal(privacy = '') {
  return {
    businessName: 'Hộ kinh doanh Bếp Thầy Mão',
    registrationNumber: null,
    registrationIssuedOn: null,
    registrationIssuedBy: null,
    address: null,
    phone: null,
    email: null,
    moitNoticeUrl: null,
    policies: kinds.map((kind) => ({
      kind,
      title: kind,
      body: kind === 'Privacy' ? privacy : '',
      updatedAt: null,
    })),
  };
}

async function render() {
  TestBed.configureTestingModule({
    providers: [provideCore(), provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
  });
  TestBed.inject(AccessTokenStore).set({ identifier: 'chu', role: 'Owner', accessToken: 't' });
  const fixture = TestBed.createComponent(LegalPage);
  const http = TestBed.inject(HttpTestingController);
  http.expectOne((request) => request.method === 'GET').flush(legal('Bảo mật'));
  await fixture.whenStable();
  return { fixture, http, html: fixture.nativeElement as HTMLElement };
}

function type(html: HTMLElement, id: string, value: string): void {
  const field = html.querySelector<HTMLInputElement | HTMLTextAreaElement>('#' + id);
  if (!field) throw new Error(id);
  field.value = value;
  field.dispatchEvent(new Event('input'));
}

function submit(html: HTMLElement, index: number): void {
  html.querySelectorAll('form')[index].dispatchEvent(new Event('submit'));
}

describe('LegalPage', () => {
  it('saves seller details with empty fields sent as null', async () => {
    const { fixture, http, html } = await render();
    expect(html.querySelector<HTMLInputElement>('#l-name')?.value).toBe(
      'Hộ kinh doanh Bếp Thầy Mão',
    );
    type(html, 'l-email', 'lienhe@vidu.vn');
    submit(html, 0);
    const request = http.expectOne((req) => req.method === 'PUT');
    expect(request.request.body).toMatchObject({ email: 'lienhe@vidu.vn', address: null });
    request.flush(legal('Bảo mật'));
    await fixture.whenStable();
    expect(html.textContent).toContain('Đã lưu thông tin người bán');
  });

  it('shows the server message when a field is rejected', async () => {
    const { fixture, http, html } = await render();
    type(html, 'l-moit', 'http://trang-la.vn');
    submit(html, 0);
    http
      .expectOne((req) => req.method === 'PUT')
      .flush(
        { status: 400, errors: { moitNoticeUrl: ['Dán đường dẫn https từ online.gov.vn.'] } },
        { status: 400, statusText: 'Bad Request' },
      );
    await fixture.whenStable();
    expect(html.textContent).toContain('Dán đường dẫn https từ online.gov.vn.');
  });

  it('edits one policy at a time and hides it when emptied', async () => {
    const { fixture, http, html } = await render();
    const privacy = Array.from(html.querySelectorAll<HTMLButtonElement>('.toolbar button')).find(
      (button) => button.textContent.includes('Privacy'),
    );
    privacy?.click();
    await fixture.whenStable();
    expect(html.querySelector<HTMLTextAreaElement>('#p-body')?.value).toBe('Bảo mật');
    type(html, 'p-body', '');
    submit(html, 1);
    const request = http.expectOne((req) => req.url.endsWith('/policies/Privacy'));
    request.flush({
      kind: 'Privacy',
      title: 'Chính sách bảo mật thông tin',
      body: '',
      updatedAt: null,
    });
    await fixture.whenStable();
    expect(html.textContent).toContain('Đã ẩn "Chính sách bảo mật thông tin" khỏi chân trang.');
  });
});
