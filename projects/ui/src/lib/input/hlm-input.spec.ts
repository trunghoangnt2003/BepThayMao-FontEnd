import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmInput } from './hlm-input';

@Component({
  imports: [ReactiveFormsModule, HlmInput],
  template: `<input hlmInput [formControl]="control" />`,
})
class Host {
  readonly control = new FormControl('', {
    nonNullable: true,
    validators: [(control) => Validators.required(control)],
  });
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const input = (fixture.nativeElement as HTMLElement).querySelector('input');
  if (!input) throw new Error('No input rendered');
  return { fixture, input };
}

it('does not announce an invalid entry before the user has visited the field', async () => {
  const { input } = await render();
  expect(input.getAttribute('aria-invalid')).toBeNull();
  expect(input.classList.contains('field__input')).toBe(true);
});

it('announces an invalid entry once the field is touched', async () => {
  const { fixture, input } = await render();
  fixture.componentInstance.control.markAsTouched();
  await fixture.whenStable();
  expect(input.getAttribute('aria-invalid')).toBe('true');
});

it('stops announcing it when the value becomes valid', async () => {
  const { fixture, input } = await render();
  fixture.componentInstance.control.markAsTouched();
  fixture.componentInstance.control.setValue('đã nhập');
  await fixture.whenStable();
  expect(input.getAttribute('aria-invalid')).toBeNull();
});
