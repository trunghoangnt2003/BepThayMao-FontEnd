import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  DestroyRef,
  EnvironmentProviders,
  inject,
  Injector,
  provideEnvironmentInitializer,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, skip } from 'rxjs';

export function provideRouteFocus(): EnvironmentProviders {
  return provideEnvironmentInitializer(() => {
    const document = inject(DOCUMENT);
    const injector = inject(Injector);
    const destroyRef = inject(DestroyRef);
    inject(Router)
      .events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        skip(1),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe(() => {
        afterNextRender(
          () => {
            document.querySelector<HTMLElement>('main#main h1')?.focus({ preventScroll: false });
          },
          { injector },
        );
      });
  });
}
