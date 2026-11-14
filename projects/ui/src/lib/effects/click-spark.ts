import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, inject, Renderer2 } from '@angular/core';

const RAYS = 8;
const LIFETIME_MS = 480;

/** Tia bắn ra quanh nút khi bấm; chỉ trang trí (aria-hidden), bỏ qua khi người dùng chọn giảm chuyển động. */
@Directive({
  selector: '[btmClickSpark]',
  host: { '(click)': 'spark()' },
})
export class BtmClickSpark {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly document = inject(DOCUMENT);

  protected spark(): void {
    const view = this.document.defaultView;
    if (!view || typeof view.matchMedia !== 'function') return;
    if (view.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const burst = this.renderer.createElement('span') as HTMLElement;
    this.renderer.addClass(burst, 'fx-spark');
    this.renderer.setAttribute(burst, 'aria-hidden', 'true');
    for (let index = 0; index < RAYS; index++) {
      const ray = this.renderer.createElement('i') as HTMLElement;
      this.renderer.setStyle(ray, 'rotate', `${String((360 / RAYS) * index)}deg`);
      this.renderer.appendChild(burst, ray);
    }
    this.renderer.appendChild(this.host.nativeElement, burst);
    view.setTimeout(() => {
      this.renderer.removeChild(this.host.nativeElement, burst);
    }, LIFETIME_MS);
  }
}
