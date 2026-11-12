import { effect, Signal, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/**
 * Bumps a counter whenever the control or any descendant changes value, status or touched state,
 * so `computed()` values that read the form re-evaluate. Call it from an injection context.
 */
export function trackForm(source: () => AbstractControl): Signal<number> {
  const version = signal(0);
  effect((onCleanup) => {
    const subscription = source().events.subscribe(() => {
      version.update((value) => value + 1);
    });
    onCleanup(() => {
      subscription.unsubscribe();
    });
  });
  return version.asReadonly();
}
