import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MenuDishDto, ShopContentDto } from '@bepthaymao/api-client';
import { CartStore, formatVnd } from '../data-access/shop-data';
import { HomePage } from './home-page';

function dish(id: string, name: string, extra: Partial<MenuDishDto> = {}): MenuDishDto {
  return {
    id,
    name,
    description: null,
    price: 30000,
    imageUrl: null,
    category: 'XoiMan',
    isFeatured: false,
    unavailableBranchIds: [],
    orderCount: 0,
    ...extra,
  };
}

const menu = [
  dish('d1', 'Xôi gà xé', {
    isFeatured: true,
    imageUrl: '/images/mon/xoi-ga-bat.jpg',
    price: 40000,
  }),
  dish('d2', 'Xôi pate chả', { unavailableBranchIds: ['b2'] }),
  dish('d3', 'Xôi gấc', { category: 'XoiNgot', isFeatured: true }),
];

const banners: ShopContentDto['banners'] = [
  {
    id: 'n1',
    title: 'Bếp Thầy Mão',
    body: 'Xôi nóng',
    imageUrl: '/images/mon/xoi-ga-hop.jpg',
    linkDishId: null,
    sortOrder: 0,
    isActive: true,
  },
  {
    id: 'n2',
    title: 'Xôi gấc',
    body: null,
    imageUrl: null,
    linkDishId: 'd3',
    sortOrder: 1,
    isActive: true,
  },
];

async function render(dishes: readonly MenuDishDto[] = menu) {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(HomePage);
  fixture.componentRef.setInput('data', {
    kind: 'loaded',
    value: { menu: dishes, content: { about: null, banners } },
  });
  await fixture.whenStable();
  return { fixture, html: fixture.nativeElement as HTMLElement };
}

function press(element: Element | null | undefined): void {
  if (!(element instanceof HTMLButtonElement)) throw new Error('Thiếu nút');
  element.click();
}

afterEach(() => {
  localStorage.clear();
});

describe('HomePage (Đặt món)', () => {
  it('shows banners with photos, a dish link or a browse button, and slide dots', async () => {
    const { html } = await render();
    const cards = html.querySelectorAll('.hb-card');
    expect(cards.length).toBe(2);
    expect(cards[0].querySelector('img')?.getAttribute('src')).toBe('/images/mon/xoi-ga-hop.jpg');
    expect(cards[0].querySelector('button.hb-cta')?.textContent).toContain('Đặt món ngay');
    expect(cards[1].querySelector('a.hb-cta')?.getAttribute('href')).toBe('/mon/d3');
    expect(html.querySelectorAll('.dots button').length).toBe(2);
  });

  it('lists every category as a tile using the first dish photo, or an icon', async () => {
    const { html } = await render();
    const tiles = Array.from(html.querySelectorAll('.cats .cat'));
    expect(tiles.map((tile) => tile.textContent.trim())).toEqual(['Xôi mặn', 'Xôi ngọt', 'Chay']);
    expect(tiles[0].querySelector('img')?.getAttribute('src')).toBe('/images/mon/xoi-ga-bat.jpg');
    expect(tiles[1].querySelector('.cat-ic')).not.toBeNull();
  });

  it('scrolls to a group when its tile is pressed and to favourites from a plain banner', async () => {
    const { html } = await render();
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    press(html.querySelectorAll('.cats .cat')[2]);
    expect(scroll).toHaveBeenCalledTimes(1);
    press(html.querySelector('button.hb-cta'));
    expect(scroll).toHaveBeenCalledTimes(2);
  });

  it('shows favourites and every group as card grids, with an empty note for a group without dishes', async () => {
    const { html } = await render();
    const fav = html.querySelector('#mon-yeu-thich');
    expect(fav?.querySelector('.fall')?.getAttribute('href')).toBe('/thuc-don');
    expect(fav?.querySelectorAll('cus-food-card').length).toBe(2);
    expect(html.querySelectorAll('#g-XoiMan cus-food-card').length).toBe(2);
    expect(html.querySelector('#g-Chay .fempty')?.textContent).toContain('thực đơn chay');
  });

  it('adds a dish from its card, marks house favourites and warns about sold-out branches', async () => {
    const { fixture, html } = await render();
    const card = html.querySelector('#g-XoiMan cus-food-card');
    if (!card) throw new Error('Thiếu thẻ món');
    expect(card.querySelector('.stamp')?.textContent).toBe('Món tủ');
    expect(card.textContent).toContain(formatVnd(40000));
    expect(
      html.querySelectorAll('#g-XoiMan cus-food-card')[1].querySelector('.pill')?.textContent,
    ).toContain('Hết ở 1 cơ sở');
    press(card.querySelector('.fadd'));
    await fixture.whenStable();
    expect(TestBed.inject(CartStore).quantityOf('d1')).toBe(1);
    expect(html.querySelector('[role="status"]')?.textContent).toContain(
      'Đã thêm Xôi gà xé vào giỏ',
    );
  });

  it('sends the plain banner to the first group when there is no favourite', async () => {
    const { html } = await render([dish('d2', 'Xôi pate chả')]);
    expect(html.querySelector('#mon-yeu-thich')).toBeNull();
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    press(html.querySelector('button.hb-cta'));
    expect(scroll).toHaveBeenCalled();
  });
});
