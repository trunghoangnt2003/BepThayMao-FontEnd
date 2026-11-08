import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HlmButton } from './hlm-button';

@Component({
  imports: [HlmButton],
  template:
    '<button hlmBtn [disabled]="disabled()" [variant]="variant()" class="custom">Lưu</button>',
})
class ButtonHost {
  disabled = signal(false);
  variant = signal<'default' | 'outline'>('default');
}

it('preserves native semantics, disabled state, static classes and reactive variants', async () => {
  const fixture = TestBed.createComponent(ButtonHost);
  await fixture.whenStable();
  const element = fixture.nativeElement as HTMLElement;
  const button = element.querySelector('button');
  if (!button) throw new Error('Button host did not render');
  expect(button.classList.contains('custom')).toBe(true);
  expect(button.classList.contains('bg-primary')).toBe(true);
  fixture.componentInstance.disabled.set(true);
  fixture.componentInstance.variant.set('outline');
  fixture.detectChanges();
  await fixture.whenStable();
  expect(button.disabled).toBe(true);
  expect(button.classList.contains('bg-background')).toBe(true);
  const directive = fixture.debugElement.query(By.directive(HlmButton)).injector.get(HlmButton);
  directive.setClass('tracking-wide');
  await fixture.whenStable();
  expect(button.classList.contains('tracking-wide')).toBe(true);
});
