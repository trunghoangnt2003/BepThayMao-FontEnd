import { Location } from '@angular/common';
import { computed, Directive, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

@Directive({
  selector: 'a[uiSkipLink]',
  host: { '[attr.href]': 'href()' },
})
export class SkipLink {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly path = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  protected readonly href = computed(
    () => `${this.location.prepareExternalUrl(this.path().split('#')[0] ?? '/')}#main`,
  );
}
