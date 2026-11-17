/**
 * Hiệu ứng cuộn của trang giới thiệu, port từ bản thử "Biển Hiệu Phố" (GSAP + ScrollTrigger):
 * ghim khung kể chuyện, hero thu nhỏ rồi ảnh xôi gà lắp từng lớp, dải tên món chạy theo tốc độ vuốt,
 * tiêu đề bật từng chữ, đoạn chuyện hiện dần, thẻ cơ sở trồi lên, bảng gọi món nhấp nháy.
 * Chỉ chạy trên trình duyệt khi MotionPreference bật; tắt thì trang giữ bản tĩnh.
 */

const DESKTOP = '(min-width: 56.25rem)';

type Gsap = typeof import('gsap').gsap;
type Trigger = typeof import('gsap/ScrollTrigger').ScrollTrigger;

/** Mọi thứ một phần hiệu ứng cần: GSAP, phạm vi root, cỡ màn và nơi gom hàm dọn dẹp. */
interface Scope {
  readonly gsap: Gsap;
  readonly trigger: Trigger;
  readonly root: HTMLElement;
  readonly desk: boolean;
  /** Chiều cao header dính trên cùng, để ghim ngay dưới header. */
  readonly top: number;
  readonly undo: (() => void)[];
  one(selector: string): HTMLElement | null;
  all(selector: string): HTMLElement[];
}

/** Tách chữ thành từng ký tự để tiêu đề bật lên; tên truy cập giữ nguyên qua aria-label. */
function splitChars(el: HTMLElement): { chars: HTMLElement[]; undo: () => void } {
  const text = el.textContent.trim();
  const wrap = document.createElement('span');
  wrap.setAttribute('aria-hidden', 'true');
  const chars: HTMLElement[] = [];
  text.split(' ').forEach((word, index) => {
    if (index > 0) wrap.append(' ');
    const w = document.createElement('span');
    w.className = 'split-w';
    for (const ch of word) {
      const c = document.createElement('span');
      c.className = 'split-c';
      c.textContent = ch;
      w.append(c);
      chars.push(c);
    }
    wrap.append(w);
  });
  const original = Array.from(el.childNodes);
  el.setAttribute('aria-label', text);
  el.replaceChildren(wrap);
  return {
    chars,
    undo: () => {
      el.replaceChildren(...original);
      el.removeAttribute('aria-label');
    },
  };
}

/** Tách đoạn văn thành từng từ (giữ thẻ <em>), bản đọc đầy đủ nằm trong span ẩn cho trình đọc màn hình. */
function splitWords(el: HTMLElement): { words: HTMLElement[]; undo: () => void } {
  const original = Array.from(el.childNodes);
  const full = document.createElement('span');
  full.className = 'visually-hidden';
  full.textContent = el.textContent.trim();
  const words: HTMLElement[] = [];
  const out: Node[] = [full];
  for (const node of original) {
    const tag = node instanceof HTMLElement ? node.tagName.toLowerCase() : null;
    for (const part of node.textContent?.split(/\s+/).filter(Boolean) ?? []) {
      const w = document.createElement('span');
      w.className = 'split-rw';
      w.setAttribute('aria-hidden', 'true');
      if (tag) {
        const inner = document.createElement(tag);
        inner.textContent = part;
        w.append(inner);
      } else {
        w.textContent = part;
      }
      words.push(w);
      out.push(w);
    }
  }
  el.replaceChildren(...out);
  return {
    words,
    undo: () => {
      el.replaceChildren(...original);
    },
  };
}

/** GSAP và ScrollTrigger; tách ra để test truyền bản giả thay cho thư viện thật. */
export interface GsapModules {
  readonly gsap: Gsap;
  readonly ScrollTrigger: Trigger;
}

/** Nạp GSAP lười: chỉ khi animation bật mới tải thư viện, trang tĩnh không tốn thêm byte nào. */
async function loadGsap(): Promise<GsapModules> {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);
  return { gsap, ScrollTrigger };
}

/** Khởi động hiệu ứng trong phạm vi root; trả về hàm dọn sạch (gỡ ghim, trả lại DOM gốc). */
export async function startLandingMotion(
  root: HTMLElement,
  load: () => Promise<GsapModules> = loadGsap,
): Promise<() => void> {
  const { gsap, ScrollTrigger } = await load();
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia(root);
  mm.add(
    { any: 'all', desk: DESKTOP },
    (context) => setup(scopeOf(gsap, ScrollTrigger, root, Boolean(context.conditions?.['desk']))),
    root,
  );
  const refresh = (): void => {
    ScrollTrigger.refresh();
  };
  void document.fonts.ready.then(refresh);
  window.addEventListener('load', refresh);
  root.addEventListener('load', refresh, true);
  return () => {
    window.removeEventListener('load', refresh);
    root.removeEventListener('load', refresh, true);
    mm.revert();
  };
}

function scopeOf(gsap: Gsap, trigger: Trigger, root: HTMLElement, desk: boolean): Scope {
  return {
    gsap,
    trigger,
    root,
    desk,
    top: document.querySelector('header')?.offsetHeight ?? 0,
    undo: [],
    one: (selector) => root.querySelector<HTMLElement>(selector),
    all: (selector) => Array.from(root.querySelectorAll<HTMLElement>(selector)),
  };
}

function setup(s: Scope): () => void {
  s.root.classList.add('lp--motion');
  s.undo.push(() => {
    s.root.classList.remove('lp--motion', 'lp--hs');
  });
  // Thanh tiến độ cuộn trên cùng.
  s.gsap.to(s.all('.lp-progress'), {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
  });
  heroIntro(s);
  storyPin(s);
  veloRows(s);
  floatHeadings(s);
  featuredTrack(s);
  revealText(s);
  branchCards(s);
  ctaBoard(s);
  s.trigger.refresh();
  return () => {
    for (const fn of s.undo.reverse()) fn();
  };
}

/** Trạng thái nghỉ của mọi thuộc tính hiệu ứng "hiện vào" dùng. */
const REST: Readonly<Record<string, number>> = {
  opacity: 1,
  scale: 1,
  x: 0,
  y: 0,
  yPercent: 0,
  rotate: 0,
};

/**
 * Hiện vào từ trạng thái `from` về trạng thái nghỉ. Dùng fromTo với đích ghi rõ thay cho gsap.from:
 * ScrollTrigger.refresh() chạy giữa lúc tween đang chạy có thể làm gsap.from ghi nhận đích là giá trị
 * đang ẩn, khiến phần tử kẹt ở opacity 0.
 */
function appear(
  s: Scope,
  targets: gsap.TweenTarget,
  from: gsap.TweenVars,
  vars: gsap.TweenVars,
): void {
  const to: gsap.TweenVars = { ...vars };
  for (const key of Object.keys(from)) {
    if (key in REST) to[key] = REST[key];
  }
  s.gsap.fromTo(targets, from, to);
}

/** Hero mở màn: ảnh hiện dần, chữ H1 bật từng ký tự, phần còn lại trồi lên, mũi tên "Lướt xuống" nhún. */
function heroIntro(s: Scope): void {
  const h1 = s.one('.hero__h');
  if (h1) {
    const split = splitChars(h1);
    s.undo.push(split.undo);
    appear(
      s,
      s.all('.hero__photo'),
      { scale: 1.08, opacity: 0 },
      { duration: 1, ease: 'power2.out', delay: 0.1 },
    );
    appear(
      s,
      split.chars,
      { yPercent: 110, opacity: 0 },
      { stagger: 0.025, duration: 0.6, ease: 'back.out(2)', delay: 0.45 },
    );
    appear(
      s,
      s.all('.hero__sub, .hero__ctas, .hero__feat, .hero__hint'),
      { y: 16, opacity: 0 },
      { stagger: 0.1, duration: 0.5, delay: 0.9 },
    );
  }
  s.gsap.to(s.all('.hero__hint .ic'), {
    y: 6,
    repeat: -1,
    yoyo: true,
    duration: 0.7,
    ease: 'sine.inOut',
  });
}

/** Ghim khung: hero thu nhỏ, ảnh xôi gà lắp từng lớp kèm chú thích, cuối cùng là món thật và hơi nóng. */
function storyPin(s: Scope): void {
  const layers = s.all('.ly');
  const caps = s.all('.cap');
  const story = s.one('.lp-story');
  s.gsap.fromTo(
    s.all('.steam path'),
    { y: 12, opacity: 0 },
    { y: -40, opacity: 0.85, duration: 2.6, ease: 'sine.in', stagger: { each: 0.8, repeat: -1 } },
  );
  if (!story || layers.length === 0 || caps.length !== layers.length + 1) return;
  s.gsap.set(layers, { y: (i: number) => -(i + 1) * (s.desk ? 26 : 30) * 2.6, opacity: 0 });
  s.gsap.set(caps, { opacity: 0, y: 14 });
  s.gsap.set(s.all('.steam'), { opacity: 0 });
  s.gsap.set(s.all('.xr'), { yPercent: 40, opacity: 0 });
  const tl = s.gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: story,
      start: `top top+=${String(s.top)}`,
      end: s.desk ? '+=320%' : '+=280%',
      scrub: 1,
      pin: true,
      anticipatePin: 1,
    },
  });
  tl.to(s.all('.hero__inner'), { scale: 0.8, yPercent: -18, opacity: 0, duration: 1 })
    .to(s.all('.xr'), { yPercent: 0, opacity: 1, duration: 1 }, '<.35')
    .to(layers, { opacity: 1, duration: 0.4, stagger: 0.05 }, '<.4');
  layers.forEach((layer, i) => {
    tl.to(layer, { y: 0, duration: 1, ease: 'power2.in' });
    if (i > 0) tl.to(caps[i - 1], { opacity: 0, y: -14, duration: 0.35 }, '<');
    tl.to(caps[i], { opacity: 1, y: 0, duration: 0.45 }, '<.25');
  });
  tl.to(caps[layers.length - 1], { opacity: 0, y: -14, duration: 0.35 })
    .to(caps[layers.length], { opacity: 1, y: 0, duration: 0.5 }, '<.2')
    .to(s.all('.steam'), { opacity: 1, duration: 0.5 }, '<')
    .to({}, { duration: 0.6 });
}

/** Dải tên món: chạy đều, vuốt nhanh thì chạy nhanh, vuốt ngược thì đổi chiều. */
function veloRows(s: Scope): void {
  let velocity = 0;
  const rows = s.all('.velo__run').map((el) => ({ el, x: 0, dir: Number(el.dataset['dir'] ?? 1) }));
  s.trigger.create({
    onUpdate: (self) => {
      velocity = s.gsap.utils.clamp(-3000, 3000, self.getVelocity());
    },
  });
  const tick = (_time: number, deltaTime: number): void => {
    velocity *= 0.92;
    const sign = velocity < 0 ? -1 : 1;
    for (const row of rows) {
      const half = row.el.scrollWidth / 2;
      row.x += row.dir * (60 + Math.abs(velocity) * 0.25) * (deltaTime / 1000) * sign;
      row.x = s.gsap.utils.wrap(-half, 0, row.x);
      s.gsap.set(row.el, { x: row.x });
    }
  };
  s.gsap.ticker.add(tick);
  s.undo.push(() => {
    s.gsap.ticker.remove(tick);
  });
}

/** Tiêu đề section bật từng chữ theo nhịp cuộn. */
function floatHeadings(s: Scope): void {
  for (const heading of s.all('[data-float]')) {
    const split = splitChars(heading);
    s.undo.push(split.undo);
    s.gsap.fromTo(
      split.chars,
      { yPercent: 120, scaleY: 2.2, scaleX: 0.7, opacity: 0, transformOrigin: '50% 0%' },
      {
        yPercent: 0,
        scaleY: 1,
        scaleX: 1,
        opacity: 1,
        stagger: 0.03,
        ease: 'back.inOut(2)',
        scrollTrigger: {
          trigger: heading,
          start: 'top bottom-=8%',
          end: 'bottom 75%',
          scrub: true,
        },
      },
    );
  }
}

/** Món quán giới thiệu: thẻ bay vào; desktop ghim lại và trượt ngang, mobile vuốt ngang tự nhiên. */
function featuredTrack(s: Scope): void {
  const menu = s.one('.featured');
  const track = s.one('.featured__track');
  if (!menu || !track) return;
  appear(
    s,
    s.all('.fcard'),
    { y: 40, opacity: 0, rotate: (i: number) => (i % 2 ? 3 : -3) },
    { stagger: 0.08, duration: 0.5, scrollTrigger: { trigger: menu, start: 'top 75%' } },
  );
  if (!s.desk) return;
  s.root.classList.add('lp--hs');
  s.gsap.to(track, {
    x: () => -Math.max(0, track.scrollWidth - (track.parentElement?.clientWidth ?? 0) + 32),
    ease: 'none',
    scrollTrigger: {
      trigger: menu,
      start: `top top+=${String(s.top)}`,
      end: () => `+=${String(Math.max(300, track.scrollWidth - window.innerWidth + 400))}`,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });
}

/**
 * Độ mờ ban đầu của từng từ. Bản thử dùng 0.12 nhưng chữ khi đó chỉ đạt tương phản 1.26:1;
 * 0.55 giữ tối thiểu ~3:1 (WCAG chữ lớn) cho cả chữ đen lẫn chữ đỏ trên nền kem.
 */
const REVEAL_START = 0.55;

/** Chuyện của bếp: đoạn văn nghiêng nhẹ rồi thẳng lại, từng từ rõ dần. */
function revealText(s: Scope): void {
  const reveal = s.one('[data-reveal]');
  if (!reveal) return;
  const split = splitWords(reveal);
  s.undo.push(split.undo);
  s.gsap.fromTo(
    reveal,
    { rotate: 2 },
    {
      rotate: 0,
      ease: 'none',
      scrollTrigger: { trigger: reveal, start: 'top bottom', end: 'bottom 55%', scrub: true },
    },
  );
  s.gsap.fromTo(
    split.words,
    { opacity: REVEAL_START, filter: 'blur(2px)' },
    {
      opacity: 1,
      filter: 'blur(0px)',
      stagger: 0.06,
      ease: 'none',
      scrollTrigger: { trigger: reveal, start: 'top 80%', end: 'bottom 50%', scrub: true },
    },
  );
}

/** Thẻ cơ sở trồi lên lần lượt. */
function branchCards(s: Scope): void {
  const grid = s.one('.br-grid');
  if (!grid) return;
  appear(
    s,
    s.all('.br'),
    { y: 60, opacity: 0 },
    {
      stagger: 0.12,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: grid, start: 'top 85%' },
    },
  );
}

/** Bảng "Đói rồi? Gọi xôi thôi!": bật vào, viền đèn nhấp nháy, nút hút theo chuột. */
function ctaBoard(s: Scope): void {
  const board = s.one('.board');
  if (!board) return;
  const blink = window.setInterval(() => {
    board.classList.toggle('alt');
  }, 600);
  s.undo.push(() => {
    window.clearInterval(blink);
    board.classList.remove('alt');
  });
  appear(
    s,
    board,
    { scale: 0.85, rotate: -2, opacity: 0 },
    { duration: 0.8, ease: 'back.out(1.6)', scrollTrigger: { trigger: board, start: 'top 75%' } },
  );
  const magnet = s.one('.magnet');
  if (magnet && window.matchMedia('(pointer: fine)').matches) magnetize(s, magnet);
}

function magnetize(s: Scope, magnet: HTMLElement): void {
  const move = (event: MouseEvent): void => {
    const r = magnet.getBoundingClientRect();
    const dx = event.clientX - (r.left + r.width / 2);
    const dy = event.clientY - (r.top + r.height / 2);
    const near = Math.abs(dx) < r.width / 2 + 80 && Math.abs(dy) < r.height / 2 + 80;
    if (near) s.gsap.to(magnet, { x: dx * 0.25, y: dy * 0.25, duration: 0.3 });
    else s.gsap.to(magnet, { x: 0, y: 0, duration: 0.5 });
  };
  window.addEventListener('mousemove', move);
  s.undo.push(() => {
    window.removeEventListener('mousemove', move);
  });
}
