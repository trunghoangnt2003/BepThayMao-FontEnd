import { GsapModules, startLandingMotion } from './landing-motion';

type Vars = Record<string, unknown>;

/** GSAP giả: ghi lại lời gọi, chạy ngay hàm matchMedia, cho test gọi tay ticker và các giá trị hàm. */
function fakeGsap(desk: boolean) {
  let cleanup: (() => void) | undefined;
  const ticks: ((time: number, delta: number) => void)[] = [];
  const timeline = { to: vi.fn(() => timeline) };
  const gsap = {
    registerPlugin: vi.fn(),
    matchMedia: () => ({
      add: (_conditions: unknown, fn: (context: { conditions: Vars }) => () => void) => {
        cleanup = fn({ conditions: { desk } });
      },
      revert: () => cleanup?.(),
    }),
    to: vi.fn(),
    fromTo: vi.fn(),
    set: vi.fn(),
    timeline: vi.fn(() => timeline),
    utils: {
      clamp: (min: number, max: number, value: number) => Math.min(max, Math.max(min, value)),
      wrap: (min: number, max: number, value: number) =>
        value < min ? max - ((min - value) % (max - min)) : value,
    },
    ticker: {
      add: (fn: (time: number, delta: number) => void) => ticks.push(fn),
      remove: vi.fn(),
    },
  };
  const ScrollTrigger = {
    create: vi.fn((options: { onUpdate: (self: { getVelocity: () => number }) => void }) => {
      options.onUpdate({ getVelocity: () => -5000 });
    }),
    refresh: vi.fn(),
  };
  const modules = { gsap, ScrollTrigger } as unknown as GsapModules;
  return { gsap, ScrollTrigger, timeline, ticks, load: () => Promise.resolve(modules) };
}

function page(): HTMLElement {
  const root = document.createElement('div');
  const html = `
    <div class="lp-progress"></div>
    <section class="lp-story">
      <div class="hero__inner">
        <div class="hero__photo"></div>
        <h1 class="hero__h">Xôi nóng phố cũ</h1>
        <p class="hero__sub">Chọn món</p>
        <span class="hero__hint"><svg class="ic"></svg></span>
      </div>
      <div class="xr">
        <svg><g class="ly"></g><g class="ly"></g><g class="steam"><path></path></g></svg>
        <ol><li class="cap">01</li><li class="cap">02</li><li class="cap">Món</li></ol>
      </div>
    </section>
    <div class="velo__run" data-dir="-1"><span>XÔI XÉO</span></div>
    <h2 data-float>Món quán</h2>
    <section class="featured"><div><ul class="featured__track"><li class="fcard"></li></ul></div></section>
    <p data-reveal>Quán xôi gia đình. <em>Sống trọn.</em></p>
    <ul class="br-grid"><li class="br"></li></ul>
    <div class="board"><span class="magnet"></span></div>`;
  root.append(...Array.from(new DOMParser().parseFromString(html, 'text/html').body.childNodes));
  document.body.append(root);
  return root;
}

beforeEach(() => {
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: { ready: Promise.resolve() },
  });
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

describe('startLandingMotion', () => {
  it('splits the headings, pins the story and restores the original DOM on cleanup', async () => {
    const fake = fakeGsap(false);
    const root = page();
    const stop = await startLandingMotion(root, fake.load);
    const h1 = root.querySelector('.hero__h');
    expect(root.classList.contains('lp--motion')).toBe(true);
    expect(h1?.getAttribute('aria-label')).toBe('Xôi nóng phố cũ');
    expect(h1?.querySelectorAll('.split-c').length).toBe('Xôinóngphốcũ'.length);
    expect(root.querySelector('[data-reveal] .visually-hidden')?.textContent).toBe(
      'Quán xôi gia đình. Sống trọn.',
    );
    expect(root.querySelector('[data-reveal] .split-rw em')?.textContent).toBe('Sống');
    expect(fake.timeline.to).toHaveBeenCalled();
    expect(fake.ScrollTrigger.refresh).toHaveBeenCalled();
    stop();
    expect(root.classList.contains('lp--motion')).toBe(false);
    expect(h1?.textContent).toBe('Xôi nóng phố cũ');
    expect(h1?.hasAttribute('aria-label')).toBe(false);
    expect(root.querySelector('[data-reveal]')?.textContent).toBe('Quán xôi gia đình. Sống trọn.');
  });

  it('ends every reveal at full opacity instead of trusting the current style', async () => {
    const fake = fakeGsap(false);
    await startLandingMotion(page(), fake.load);
    const photo = fake.gsap.fromTo.mock.calls.find(
      ([target]) =>
        Array.isArray(target) && (target[0] as Element).classList.contains('hero__photo'),
    );
    expect(photo?.[2]).toMatchObject({ opacity: 1, scale: 1, duration: 1 });
    const card = fake.gsap.fromTo.mock.calls.find(
      ([target]) => Array.isArray(target) && (target[0] as Element).classList.contains('fcard'),
    );
    const rotate = (card?.[1] as Vars)['rotate'] as (i: number) => number;
    expect([rotate(0), rotate(1)]).toEqual([-3, 3]);
    expect(card?.[2]).toMatchObject({ opacity: 1, y: 0, rotate: 0 });
  });
});

describe('startLandingMotion on-page effects', () => {
  it('moves the dish strip faster and backwards when the visitor scrolls up quickly', async () => {
    const fake = fakeGsap(false);
    const root = page();
    await startLandingMotion(root, fake.load);
    const run = root.querySelector('.velo__run');
    fake.ticks.forEach((tick) => {
      tick(0, 16);
    });
    const moved = fake.gsap.set.mock.calls.find(([target]) => target === run);
    expect((moved?.[1] as Vars)['x']).not.toBe(0);
  });

  it('pins the featured track sideways on desktop and blinks the call-to-action board', async () => {
    const fake = fakeGsap(true);
    const root = page();
    const stop = await startLandingMotion(root, fake.load);
    expect(root.classList.contains('lp--hs')).toBe(true);
    const track = root.querySelector('.featured__track');
    const slide = fake.gsap.to.mock.calls.find(([target]) => target === track)?.[1] as Vars;
    expect((slide['x'] as () => number)()).toBeLessThanOrEqual(0);
    const end = (slide['scrollTrigger'] as Vars)['end'] as () => string;
    expect(end()).toMatch(/^\+=\d+$/);
    const board = root.querySelector('.board');
    vi.advanceTimersByTime(600);
    expect(board?.classList.contains('alt')).toBe(true);
    stop();
    expect(board?.classList.contains('alt')).toBe(false);
    expect(fake.gsap.ticker.remove).toHaveBeenCalled();
  });

  it('pulls the order button toward a nearby pointer and lets it go when far', async () => {
    const fake = fakeGsap(false);
    const root = page();
    const stop = await startLandingMotion(root, fake.load);
    const magnet = root.querySelector('.magnet');
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 10 }));
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 900, clientY: 900 }));
    const pulls = fake.gsap.to.mock.calls.filter(([target]) => target === magnet);
    expect(pulls.map(([, vars]) => (vars as Vars)['duration'])).toEqual([0.3, 0.5]);
    stop();
  });
});
