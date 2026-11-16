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
  it('shows the hero D headline with a focusable h1', async () => {
    const { html } = await render('Quán xôi gia đình.', [branch]);
    const h1 = html.querySelector('h1');
    expect(h1?.textContent.trim()).toBe('Xôi nóng phố cũ, giao tận nơi');
    expect(h1?.id).toBe('hero-h');
    expect(h1?.getAttribute('tabindex')).toBe('-1');
  });

  it('sends every order button to /dat-mon and the facility button to #co-so', async () => {
    const { html } = await render('Quán xôi gia đình.', [branch]);
    const order = Array.from(html.querySelectorAll('a')).filter((link) =>
      link.textContent.includes('Đặt món ngay'),
    );
    expect(order.length).toBeGreaterThan(0);
    expect(order.every((link) => link.getAttribute('href') === '/dat-mon')).toBe(true);
    expect(html.querySelectorAll('.hero a').length).toBeGreaterThan(0);
    expect(
      Array.from(html.querySelectorAll('.hero a')).some((link) =>
        link.textContent.includes('Đặt món ngay'),
      ),
    ).toBe(true);
    const facility = Array.from(html.querySelectorAll('a')).find((link) =>
      link.textContent.includes('Xem cơ sở'),
    );
    expect(facility?.getAttribute('href')).toBe('#co-so');
  });

  it('lists the three hero promises in order', async () => {
    const { html } = await render('Quán xôi gia đình.', [branch]);
    const items = Array.from(html.querySelectorAll('.hero__feat li')).map((item) =>
      item.textContent.trim(),
    );
    expect(items).toEqual(['Nguyên liệu tươi ngon', 'Hương vị truyền thống', 'Phục vụ tận tâm']);
  });

  it('renders the hero photo with Vietnamese alt text, high priority and decorative icons', async () => {
    const { html } = await render('Quán xôi gia đình.', [branch]);
    const img = html.querySelector('.hero__photo img');
    expect(img?.getAttribute('alt')).toContain('xôi gà');
    expect(img?.getAttribute('src')?.endsWith('/images/landing/xoi-ga-hero.jpg')).toBe(true);
    expect(img?.getAttribute('fetchpriority')).toBe('high');
    const icons = Array.from(html.querySelectorAll('.hero svg'));
    expect(icons.length).toBeGreaterThan(0);
    expect(icons.every((icon) => icon.getAttribute('aria-hidden') === 'true')).toBe(true);
  });

  it('never leaks the license TODO or the stock vendor name into the page', async () => {
    const { html } = await render('Quán xôi gia đình.', [branch]);
    expect(html.textContent).not.toContain('TODO');
    expect(html.textContent).not.toContain('AdobeStock');
  });
});

describe('LandingPage data sections', () => {
  it('keeps real about text, branch hours and featured dishes on the page', async () => {
    const { html } = await render('Quán xôi gia đình.', [branch]);
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
