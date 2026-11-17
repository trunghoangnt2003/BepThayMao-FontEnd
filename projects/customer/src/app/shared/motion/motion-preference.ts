import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { effect, inject, Injectable, PLATFORM_ID } from '@angular/core';

/**
 * Animation của web khách luôn bật trên trình duyệt thật (không có nút bật/tắt). Phía server luôn false để HTML
 * ban đầu là bản tĩnh. Gắn class "anim" lên <html> khi animation đang bật.
 */
@Injectable({ providedIn: 'root' })
export class MotionPreference {
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  /** Cần trình duyệt thật có matchMedia (GSAP dùng); môi trường thiếu (jsdom) thì giữ bản tĩnh. */
  private readonly on = this.browser && typeof this.document.defaultView?.matchMedia === 'function';
  readonly enabled = (): boolean => this.on;

  constructor() {
    effect(() => {
      this.document.documentElement.classList.toggle('anim', this.on);
    });
  }
}
