import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PolicyDto } from '@bepthaymao/api-client';
import { kindOfSlug, slugOf } from '../data-access/legal.service';
import { PolicyPage } from '../pages/policy-page';
import { SiteFooter } from './site-footer';

const filled = {
  businessName: 'Hộ kinh doanh Bếp Thầy Mão',
  registrationNumber: '01A8000000',
  registrationIssuedOn: '2024-03-01',
  registrationIssuedBy: 'UBND quận Mẫu',
  address: 'Số 1 Đường Mẫu',
  phone: '0900 000 000',
  email: 'lienhe@vidu.vn',
  moitNoticeUrl: 'https://online.gov.vn/Home/WebDetails/1',
  policies: [{ kind: 'Privacy', title: 'Chính sách bảo mật thông tin' }],
};

async function renderFooter(body: object) {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
  });
  const fixture = TestBed.createComponent(SiteFooter);
  TestBed.inject(HttpTestingController)
    .expectOne((request) => request.url.endsWith('/shop/legal'))
    .flush(body);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('SiteFooter', () => {
  it('shows the seller details, policies and the ministry notice the owner entered', async () => {
    const html = await renderFooter(filled);
    expect(html.textContent).toContain('Hộ kinh doanh Bếp Thầy Mão');
    expect(html.textContent).toContain('01A8000000, cấp ngày 01/03/2024, tại UBND quận Mẫu');
    expect(html.querySelector('a[href="tel:0900000000"]')).not.toBeNull();
    expect(html.querySelector('a[href="mailto:lienhe@vidu.vn"]')).not.toBeNull();
    expect(html.querySelector('a.moit')?.getAttribute('href')).toBe(filled.moitNoticeUrl);
    expect(html.querySelector('a[href="/chinh-sach/bao-mat"]')?.textContent).toContain(
      'Chính sách bảo mật thông tin',
    );
  });

  it('hides sections the owner has not filled in', async () => {
    const html = await renderFooter({
      businessName: null,
      registrationNumber: null,
      registrationIssuedOn: null,
      registrationIssuedBy: null,
      address: null,
      phone: null,
      email: null,
      moitNoticeUrl: null,
      policies: [],
    });
    expect(html.querySelector('#ft-seller')).toBeNull();
    expect(html.querySelector('#ft-policy')).toBeNull();
    expect(html.querySelector('a.moit')).toBeNull();
    expect(html.textContent).toContain('Bếp Thầy Mão');
  });

  it('keeps the fixed links when the legal request fails', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(SiteFooter);
    TestBed.inject(HttpTestingController)
      .expectOne((request) => request.url.endsWith('/shop/legal'))
      .flush(null, { status: 500, statusText: 'Error' });
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Tra cứu đơn');
  });
});

describe('policy pages', () => {
  it('maps friendly slugs both ways', () => {
    expect(slugOf('Refund')).toBe('doi-tra');
    expect(kindOfSlug('khieu-nai')).toBe('Complaint');
    expect(kindOfSlug('khong-co')).toBeNull();
  });

  it('shows the owner text or an empty notice', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(PolicyPage);
    const policy: PolicyDto = {
      kind: 'Privacy',
      title: 'Chính sách bảo mật thông tin',
      body: 'Dòng một\nDòng hai',
      updatedAt: '2026-11-14T03:00:00Z',
    };
    fixture.componentRef.setInput('policy', { kind: 'loaded', value: policy });
    await fixture.whenStable();
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('h1')?.textContent).toContain('Chính sách bảo mật thông tin');
    expect(html.textContent).toContain('Cập nhật ngày 14/11/2026');
    fixture.componentRef.setInput('policy', null);
    await fixture.whenStable();
    expect(html.querySelector('h1')?.textContent).toContain('Chưa có nội dung');
  });
});
