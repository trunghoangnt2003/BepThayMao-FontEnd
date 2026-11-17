import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MenuDishDto, PublicBranch } from '@bepthaymao/api-client';
import { formatVnd } from '../../shop/data-access/shop-data';
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

const defaultMenu = [
  dish('d1', 'Xôi xéo'),
  dish('d2', 'Xôi gấc', { category: 'XoiNgot', isFeatured: true, price: 35000 }),
];

async function render(
  about: string | null,
  branches: readonly PublicBranch[],
  menu: readonly MenuDishDto[] = defaultMenu,
) {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(LandingPage);
  fixture.componentRef.setInput('data', {
    kind: 'loaded',
    value: {
      menu,
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
  it('pins the hero and the chicken story in one stage with the real chicken dish', async () => {
    const menu = [...defaultMenu, dish('d3', 'Xôi gà xé', { price: 40000 })];
    const { html } = await render('Quán xôi gia đình.', [branch], menu);
    const story = html.querySelector('#story .stage cus-landing-hero + cus-landing-story');
    expect(story).not.toBeNull();
    expect(story?.querySelector('.cap--final')?.textContent).toContain('Xôi gà xé');
  });

  it('keeps real about text, branch hours and featured dishes on the page', async () => {
    const { html } = await render('Quán xôi gia đình.', [branch]);
    expect(html.textContent).toContain('Quán xôi gia đình.');
    expect(html.textContent).toContain('Nhận đơn 06:00 đến 21:30');
    expect(html.querySelector('.featured')?.textContent).toContain('Xôi gấc');
  });

  it('hides empty story text and branch cards', async () => {
    const { html } = await render(null, []);
    expect(html.querySelector('[data-reveal]')).toBeNull();
    expect(html.querySelector('cus-landing-branches')).toBeNull();
  });
});

describe('LandingPage D sections', () => {
  it('has no eyebrow kicker or accent word anywhere', async () => {
    const { html } = await render('Quán xôi gia đình.', [branch]);
    expect(html.querySelector('.kicker')).toBeNull();
    expect(html.querySelector('.accent-word')).toBeNull();
  });

  it('scrolls every real dish name, upper-cased, in two decorative strips', async () => {
    const { html } = await render(null, [branch]);
    const velo = html.querySelector('.velo');
    expect(velo?.getAttribute('aria-hidden')).toBe('true');
    expect(velo?.querySelectorAll('.velo__run').length).toBe(2);
    expect(velo?.textContent).toContain('XÔI XÉO');
    expect(velo?.textContent).toContain('XÔI GẤC');
  });

  it('hides the dish strip for an empty menu', async () => {
    const { html } = await render(null, [branch], []);
    expect(html.querySelector('.velo')).toBeNull();
  });

  it('shows the featured dish with its real price and link', async () => {
    const { html } = await render(null, [branch]);
    const featured = html.querySelector('.featured');
    expect(featured?.textContent).toContain('Xôi gấc');
    expect(featured?.textContent).toContain(formatVnd(35000));
    expect(featured?.querySelector('a')?.getAttribute('href')).toBe('/mon/d2');
  });

  it('hides the featured section when no dish is featured', async () => {
    const { html } = await render(null, [branch], [dish('d1', 'Xôi xéo')]);
    expect(html.querySelector('.featured')).toBeNull();
  });
});

describe('LandingPage about, branches and final call', () => {
  it('shows the shop story text followed by the brand promise', async () => {
    const { html } = await render('Quán xôi gia đình.', [branch]);
    const reveal = html.querySelector('[data-reveal]');
    expect(reveal?.textContent).toContain('Quán xôi gia đình.');
    expect(reveal?.querySelector('em')?.textContent).toBe('Sống trọn từng vị ngon.');
  });

  it('hides the about section when the shop wrote nothing', async () => {
    const { html } = await render(null, [branch]);
    expect(html.querySelector('[data-reveal]')).toBeNull();
  });

  it('lists real branches inside the #co-so section', async () => {
    const { html } = await render(null, [branch]);
    expect(html.querySelector('section#co-so cus-landing-branches')?.textContent).toContain(
      'Nhận đơn 06:00 đến 21:30',
    );
  });

  it('keeps the #co-so section with a directory link when there is no branch', async () => {
    const { html } = await render(null, []);
    const section = html.querySelector('section#co-so');
    expect(section).not.toBeNull();
    expect(section?.querySelector('cus-landing-branches')).toBeNull();
    expect(section?.querySelector('.more a')?.getAttribute('href')).toBe('/co-so');
  });

  it('closes with the final call to order', async () => {
    const { html } = await render(null, [branch], []);
    expect(html.querySelector('.cta h2')?.textContent.trim()).toBe('Đói rồi? Gọi xôi thôi!');
    const order = Array.from(html.querySelectorAll('a')).filter(
      (link) =>
        link.textContent.includes('Đặt món ngay') && link.getAttribute('href') === '/dat-mon',
    );
    expect(order.length).toBeGreaterThanOrEqual(2);
    expect(html.querySelector('.cta a')?.getAttribute('href')).toBe('/dat-mon');
  });
});
