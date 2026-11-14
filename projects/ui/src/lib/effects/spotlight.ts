import { Directive, ElementRef, inject } from '@angular/core';

/** Vệt sáng theo con trỏ trên thẻ (kèm class fx-spotlight). Chỉ đặt biến CSS, không đổi bố cục. */
@Directive({
  selector: '[btmSpotlight]',
  host: { class: 'fx-spotlight', '(pointermove)': 'move($event)' },
})
export class BtmSpotlight {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected move(event: PointerEvent): void {
    if (event.pointerType !== 'mouse') return;
    const element = this.host.nativeElement;
    const box = element.getBoundingClientRect();
    element.style.setProperty('--mx', `${String(event.clientX - box.left)}px`);
    element.style.setProperty('--my', `${String(event.clientY - box.top)}px`);
  }
}
