import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HlmButton } from './hlm-button';

@Component({
  imports: [HlmButton],
  template: '<button hlmBtn type="button" [disabled]="disabled()">Thử lại</button>',
})
class Probe {
  readonly disabled = signal(false);
}

@Component({
  imports: [HlmButton],
  template: '<button hlmBtn variant="danger" type="button">Tắt nhận đơn</button>',
})
class DangerProbe {
  readonly ready = true;
}
describe('Chanh muối helm button', () => {
  it('uses brain disabled behavior and Chanh muối primary styling', async () => {
    const fixture = TestBed.createComponent(Probe);
    await fixture.whenStable();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(button?.classList.contains('btn--primary')).toBe(true);
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();
    expect(button?.disabled).toBe(true);
  });

  it('styles the danger variant with .btn--danger and without the primary style', async () => {
    const fixture = TestBed.createComponent(DangerProbe);
    await fixture.whenStable();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(button?.classList.contains('btn--danger')).toBe(true);
    expect(button?.classList.contains('btn--primary')).toBe(false);
  });
});
