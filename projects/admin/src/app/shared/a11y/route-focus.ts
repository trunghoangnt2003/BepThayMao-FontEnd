import { DOCUMENT } from '@angular/common';
import { afterNextRender, inject, Injector, provideEnvironmentInitializer } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, skip } from 'rxjs';

export function provideRouteFocus() {
  return provideEnvironmentInitializer(() => {
    const document = inject(DOCUMENT);
    const injector = inject(Injector);
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        skip(1),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        afterNextRender(() => document.querySelector<HTMLElement>('main#main h1')?.focus(), {
          injector,
        });
      });
  });
}
