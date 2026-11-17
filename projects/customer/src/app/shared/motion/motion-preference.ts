import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

const STORAGE_KEY = 'btm-motion';

/** true: luôn bật, false: luôn tắt, null: theo cài đặt "giảm chuyển động" của máy. */
export type MotionChoice = boolean | null;

/**
 * Bật/tắt animation của web khách. Mặc định theo prefers-reduced-motion của máy; khách có thể bật
 * hoặc tắt hẳn, lựa chọn lưu trong localStorage. Gắn class "anim" lên <html> khi animation đang bật.
 */
@Injectable({ providedIn: 'root' })
export class MotionPreference {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly document = inject(DOCUMENT);
  private readonly choice = signal<MotionChoice>(this.read());
  /** Mặc định coi như giảm chuyển động; chỉ đổi khi đọc được matchMedia thật của trình duyệt. */
  private readonly reduced = signal(true);

  /** Lựa chọn của khách: true, false hoặc null (theo máy). */
  readonly forced = this.choice.asReadonly();
  /** Máy đang bật "giảm chuyển động". */
  readonly systemReduced = this.reduced.asReadonly();
  /** Animation có chạy hay không. Phía server luôn false để HTML ban đầu là bản tĩnh. */
  readonly enabled = computed(() => {
    if (!this.browser) return false;
    const forced = this.choice();
    return forced ?? !this.reduced();
  });
  /** Hiện thanh mời bật animation khi máy giảm chuyển động và khách chưa chọn. */
  readonly offerEnable = computed(() => this.supported && this.reduced() && this.choice() === null);
  /** Trình duyệt thật có matchMedia; môi trường thiếu (SSR, jsdom) thì không mời bật. */
  private supported = false;

  constructor() {
    const view = this.document.defaultView;
    if (this.browser && typeof view?.matchMedia === 'function') {
      this.supported = true;
      const query = view.matchMedia('(prefers-reduced-motion: reduce)');
      this.reduced.set(query.matches);
      query.addEventListener('change', (event) => {
        this.reduced.set(event.matches);
      });
    }
    effect(() => {
      this.document.documentElement.classList.toggle('anim', this.enabled());
    });
  }

  enable(): void {
    this.save(true);
  }

  /** Đảo trạng thái hiện tại và ghi nhớ thành lựa chọn cố định. */
  toggle(): void {
    this.save(!this.enabled());
  }

  private save(value: MotionChoice): void {
    this.choice.set(value);
    if (!this.browser) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      // Trình duyệt chặn localStorage: lựa chọn chỉ giữ trong phiên này.
    }
  }

  private read(): MotionChoice {
    if (!this.browser) return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const value: unknown = raw === null ? null : JSON.parse(raw);
      return typeof value === 'boolean' ? value : null;
    } catch {
      return null;
    }
  }
}
