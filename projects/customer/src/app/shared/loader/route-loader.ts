import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';
import { KitchenLoader } from './kitchen-loader';

/** Chỉ hiện khi chuyển trang chậm hơn ngưỡng này, để trang nhanh không bị nháy loader. */
export const ROUTE_LOADER_DELAY_MS = 250;

/** Lớp phủ khi đang tải trang mới (resolver chờ API): chõ xôi bốc khói giữa màn hình. */
@Component({
  selector: 'cus-route-loader',
  imports: [KitchenLoader],
  template: `
    @if (visible()) {
      <div class="veil">
        <div class="card"><cus-kitchen-loader /></div>
      </div>
    }
  `,
  styles: `
    .veil {
      position: fixed;
      inset: 0;
      z-index: var(--z-modal);
      display: grid;
      place-items: center;
      padding: var(--space-md);
      background:
        radial-gradient(circle at 50% 48%, oklch(42% 0.07 62 / 0.55), transparent 42%),
        oklch(20% 0.03 50 / 0.86);
      backdrop-filter: blur(8px);
      animation: in 240ms ease-out both;
    }
    .card {
      --loader-ink: var(--gold);
    }
    @keyframes in {
      from {
        opacity: 0;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .veil {
        animation: none;
      }
    }
  `,
})
export class RouteLoader {
  protected readonly visible = signal(false);
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    inject(Router)
      .events.pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (event instanceof NavigationStart) this.start();
        else if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        )
          this.stop();
      });
    inject(DestroyRef).onDestroy(() => {
      this.clear();
    });
  }

  private start(): void {
    this.clear();
    this.timer = setTimeout(() => {
      this.visible.set(true);
    }, ROUTE_LOADER_DELAY_MS);
  }

  private stop(): void {
    this.clear();
    this.visible.set(false);
  }

  private clear(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }
}
