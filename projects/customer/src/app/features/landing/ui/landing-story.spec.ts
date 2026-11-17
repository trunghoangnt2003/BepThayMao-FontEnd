import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MenuDishDto } from '@bepthaymao/api-client';
import { CartStore, formatVnd } from '../../shop/data-access/shop-data';
import { LandingStory, STORY_STEPS } from './landing-story';

const ga: MenuDishDto = {
  id: 'd1',
  name: 'Xôi gà xé',
  description: 'Gà luộc xé',
  price: 40000,
  imageUrl: null,
  category: 'XoiMan',
  isFeatured: false,
  unavailableBranchIds: [],
  orderCount: 0,
};

async function render(dish: MenuDishDto | null) {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(LandingStory);
  fixture.componentRef.setInput('dish', dish);
  fixture.componentRef.setInput('image', '/images/landing/xoi-ga-lop.jpg');
  await fixture.whenStable();
  const host = fixture.nativeElement as HTMLElement;
  return { fixture, host };
}

afterEach(() => {
  localStorage.clear();
});

describe('LandingStory content', () => {
  it('cuts one labelled photo into five layers and lists six captions from STORY_STEPS', async () => {
    const { host } = await render(null);
    const art = host.querySelector('svg[role="img"]');
    expect(art?.getAttribute('aria-label')).toContain('xôi gà');
    expect(art?.querySelectorAll('.ly').length).toBe(5);
    expect(art?.querySelector('image')?.getAttribute('href')).toBe(
      '/images/landing/xoi-ga-lop.jpg',
    );
    const caps = Array.from(host.querySelectorAll('ol.caps > li'));
    expect(caps.length).toBe(6);
    const names = [
      'Xôi nếp',
      'Rau thơm, đồ chua',
      'Gà luộc',
      'Hành phi, lá chanh',
      'Trứng cút, thịt băm',
    ];
    expect(STORY_STEPS.map((step) => step.name)).toEqual(names);
    names.forEach((name, index) => {
      expect(caps[index].textContent).toContain(String(index + 1).padStart(2, '0'));
      expect(caps[index].textContent).toContain(name);
    });
  });

  it('shows the real chicken dish and its price, and adds it to the cart', async () => {
    const { fixture, host } = await render(ga);
    const final = host.querySelector('.cap--final');
    expect(final?.textContent).toContain('Xôi gà xé');
    expect(final?.textContent).toContain(formatVnd(40000));
    final?.querySelector('button')?.click();
    await fixture.whenStable();
    expect(TestBed.inject(CartStore).quantityOf('d1')).toBe(1);
    expect(host.querySelector('[role="status"]')?.textContent).toContain('Đã thêm Xôi gà xé');
  });

  it('falls back to /dat-mon without any price when there is no chicken dish', async () => {
    const { host } = await render(null);
    const final = host.querySelector('.cap--final');
    expect(final?.querySelector('a')?.getAttribute('href')).toBe('/dat-mon');
    expect(final?.textContent).not.toMatch(/\d[\d.,\s]*[đ₫]/);
  });
});
