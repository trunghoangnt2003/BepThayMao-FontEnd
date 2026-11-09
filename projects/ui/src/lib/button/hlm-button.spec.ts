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
describe('Garden helm button', () => {
  it('uses brain disabled behavior and Garden primary styling', async () => {
    const fixture = TestBed.createComponent(Probe);
    await fixture.whenStable();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(button?.classList.contains('btn--primary')).toBe(true);
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();
    expect(button?.disabled).toBe(true);
  });
});
