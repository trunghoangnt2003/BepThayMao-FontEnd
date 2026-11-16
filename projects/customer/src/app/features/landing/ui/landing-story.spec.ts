import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MenuDishDto } from '@bepthaymao/api-client';
import { formatVnd } from '../../shop/data-access/shop-data';
import { LandingStory, STORY_STEPS } from './landing-story';

const xeo: MenuDishDto = {
  id: 'd1',
  name: 'Xôi xéo',
  description: 'Xôi xéo đậu xanh',
  price: 30000,
  imageUrl: null,
  category: 'XoiMan',
  isFeatured: false,
  unavailableBranchIds: [],
  orderCount: 0,
};

class FakeObserver {
  static readonly all: FakeObserver[] = [];
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
  constructor(readonly callback: (entries: { isIntersecting: boolean }[]) => void) {
    FakeObserver.all.push(this);
  }
}

async function render(dish: MenuDishDto | null) {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(LandingStory);
  fixture.componentRef.setInput('dish', dish);
  await fixture.whenStable();
  const host = fixture.nativeElement as HTMLElement;
  return { fixture, host };
}

afterEach(() => {
  vi.unstubAllGlobals();
  FakeObserver.all.length = 0;
});

describe('LandingStory content', () => {
  it('renders five layers, a labelled drawing and six captions from STORY_STEPS', async () => {
    const { host } = await render(null);
    const art = host.querySelector('svg[role="img"]');
    expect(art?.getAttribute('aria-label')).toContain('xôi xéo');
    expect(art?.querySelectorAll('.story__layer').length).toBe(5);
    const caps = Array.from(host.querySelectorAll('ol.story__caps > li'));
    expect(caps.length).toBe(6);
    const names = ['Nếp dẻo', 'Đậu xanh', 'Hành phi', 'Chả lụa', 'Trứng kho'];
    expect(STORY_STEPS.map((step) => step.name)).toEqual(names);
    names.forEach((name, index) => {
      expect(caps[index].textContent).toContain(String(index + 1).padStart(2, '0'));
      expect(caps[index].textContent).toContain(name);
    });
  });

  it('shows the real dish name, price and link on the final card when a xéo dish exists', async () => {
    const { host } = await render(xeo);
    const final = host.querySelector('.story__cap--final');
    expect(final?.textContent).toContain('Xôi xéo');
    expect(final?.textContent).toContain(formatVnd(30000));
    expect(final?.querySelector('a')?.getAttribute('href')).toBe('/mon/d1');
  });

  it('falls back to /dat-mon without any price when there is no xéo dish', async () => {
    const { host } = await render(null);
    const final = host.querySelector('.story__cap--final');
    expect(final?.querySelector('a')?.getAttribute('href')).toBe('/dat-mon');
    expect(final?.textContent).not.toMatch(/\d[\d.,\s]*[đ₫]/);
  });
});

describe('LandingStory motion fallback', () => {
  it('stays static when reduced motion is requested', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    const { host } = await render(null);
    expect(host.classList.contains('story--io')).toBe(false);
    expect(FakeObserver.all.length).toBe(0);
  });

  it('uses IntersectionObserver when scroll-driven animation is unsupported', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    vi.stubGlobal('CSS', { supports: () => false });
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    const { fixture, host } = await render(null);
    expect(host.classList.contains('story--io')).toBe(true);
    const observer = FakeObserver.all[0];
    expect(observer.observe).toHaveBeenCalled();
    observer.callback([{ isIntersecting: true }]);
    await fixture.whenStable();
    expect(host.classList.contains('is-in')).toBe(true);
    expect(observer.unobserve).toHaveBeenCalled();
    fixture.destroy();
    expect(observer.disconnect).toHaveBeenCalled();
  });

  it('leaves the work to CSS when animation-timeline is supported', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    vi.stubGlobal('CSS', { supports: () => true });
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    const { host } = await render(null);
    expect(host.classList.contains('story--io')).toBe(false);
    expect(FakeObserver.all.length).toBe(0);
  });

  it('does not throw when matchMedia, CSS and IntersectionObserver are all missing', async () => {
    vi.stubGlobal('matchMedia', undefined);
    vi.stubGlobal('CSS', undefined);
    vi.stubGlobal('IntersectionObserver', undefined);
    const { host } = await render(null);
    expect(host.classList.contains('story--io')).toBe(false);
    expect(host.classList.contains('is-in')).toBe(false);
  });
});
