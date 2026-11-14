import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MenuDishDto, PublicBranch } from '@bepthaymao/api-client';
import { LandingPage } from './landing-page';

function dish(id: string, name: string, extra: Partial<MenuDishDto> = {}): MenuDishDto {
  return {
    id,
    name,
    description: `Mô tả ${name}`,
    price: 30000,
    imageUrl: null,
    category: 'XoiMan',
    isFeatured: false,
    unavailableBranchIds: [],
    orderCount: 0,
    ...extra,
  };
}

const branch: PublicBranch = {
  id: 'b1',
  name: 'Cơ sở Mẫu 1',
  address: 'Số 1 Đường Mẫu',
  phone: '0900000000',
  openTime: '06:00:00',
  closeTime: '21:30:00',
};

async function render(about: string | null, branches: readonly PublicBranch[]) {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(LandingPage);
  fixture.componentRef.setInput('data', {
    kind: 'loaded',
    value: {
      menu: [
        dish('d1', 'Xôi xéo'),
        dish('d2', 'Xôi gấc', { category: 'XoiNgot', isFeatured: true, price: 35000 }),
      ],
      content: { about, banners: [] },
    },
  });
  fixture.componentRef.setInput('branches', { kind: 'loaded', branches });
  await fixture.whenStable();
  return { fixture, html: fixture.nativeElement as HTMLElement };
}

describe('LandingPage', () => {
  it('tells the real menu and branch counts and sends every order button to /dat-mon', async () => {
    const { html } = await render('Quán xôi gia đình.', [branch]);
    expect(html.querySelector('h1')?.textContent).toContain('dẻo thơm');
    const facts = Array.from(html.querySelectorAll('.facts dd')).map((item) =>
      item.textContent.trim(),
    );
    expect(facts).toEqual(['2', '1', 'QR']);
    const order = Array.from(html.querySelectorAll('a')).filter((link) =>
      link.textContent.includes('Đặt ngay'),
    );
    expect(order.length).toBe(2);
    expect(order.every((link) => link.getAttribute('href') === '/dat-mon')).toBe(true);
    expect(html.textContent).toContain('Quán xôi gia đình.');
    expect(html.textContent).toContain('Nhận đơn 06:00 đến 21:30');
    expect(html.querySelector('.featured')?.textContent).toContain('Xôi gấc');
  });

  it('previews the dish under the pointer and hides empty story and branch sections', async () => {
    const { fixture, html } = await render(null, []);
    expect(html.querySelector('.story')).toBeNull();
    expect(html.querySelector('cus-landing-branches')).toBeNull();
    expect(html.querySelector('figcaption')?.textContent).toContain('Xôi gấc');
    const xeo = Array.from(html.querySelectorAll('cus-landing-menu a')).find((link) =>
      link.textContent.includes('Xôi xéo'),
    );
    xeo?.dispatchEvent(new Event('mouseenter'));
    await fixture.whenStable();
    expect(html.querySelector('figcaption')?.textContent).toContain('Xôi xéo');
  });
});
