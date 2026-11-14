import { Component, ElementRef, input, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ShopContentDto } from '@bepthaymao/api-client';

/** Banner giới thiệu quán do chủ quán cài; không tự chạy, vuốt hoặc bấm mũi tên. */
@Component({
  selector: 'cus-banner-strip',
  imports: [RouterLink],
  template: `
    <section class="banner" aria-roledescription="carousel" aria-label="Giới thiệu Bếp Thầy Mão">
      <div class="track" #track tabindex="0" (scroll)="onScroll(track)">
        @for (banner of banners(); track banner.id; let index = $index) {
          <article
            class="slide"
            [attr.data-tone]="index % 3"
            aria-roledescription="slide"
            [attr.aria-label]="index + 1 + ' trên ' + banners().length"
          >
            <h2>{{ banner.title }}</h2>
            @if (banner.body) {
              <p>{{ banner.body }}</p>
            }
            @if (banner.linkDishId) {
              <a class="go" [routerLink]="['/mon', banner.linkDishId]">Xem món</a>
            }
          </article>
        }
      </div>
      @if (banners().length > 1) {
        <div class="controls">
          <span class="num">{{ slide() + 1 }}/{{ banners().length }}</span>
          <span class="buttons">
            <button type="button" (click)="go(-1)" aria-label="Banner trước">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            <button type="button" (click)="go(1)" aria-label="Banner sau">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </span>
        </div>
      }
    </section>
  `,
  styles: `
    .banner {
      display: grid;
      gap: var(--space-xs);
    }
    .track {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: 100%;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      border-radius: var(--radius-panel);
    }
    .slide {
      position: relative;
      overflow: hidden;
      display: grid;
      align-content: end;
      gap: var(--space-xs);
      min-height: 150px;
      padding: var(--space-lg);
      scroll-snap-align: start;
      background: var(--dau);
      color: var(--cocoa);
    }
    .slide::after {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 60%;
      aspect-ratio: 1;
      border-radius: 50%;
      background: oklch(100% 0 0 / 0.25);
    }
    .slide[data-tone='1'] {
      background: var(--gac);
      color: var(--on-cocoa);
    }
    .slide[data-tone='2'] {
      background: var(--cocoa-2);
      color: var(--on-cocoa);
    }
    .slide h2 {
      position: relative;
      font-size: 1.5rem;
      font-weight: var(--weight-heavy);
    }
    .slide p {
      position: relative;
      max-width: 30ch;
      font-size: var(--text-sm);
    }
    .go {
      position: relative;
      justify-self: start;
      display: inline-flex;
      align-items: center;
      min-height: 40px;
      padding-inline: var(--space-md);
      border-radius: var(--radius-pill);
      background: var(--color-paper-2);
      color: var(--cocoa);
      font-weight: var(--weight-strong);
      text-decoration: none;
    }
    .controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-inline: var(--space-xs);
      color: var(--color-muted);
      font-size: var(--text-sm);
    }
    .buttons {
      display: flex;
      gap: var(--space-xs);
    }
    .buttons button {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      border: 0;
      border-radius: var(--radius-pill);
      background: var(--color-paper-2);
      color: var(--color-ink);
      cursor: pointer;
    }
    .buttons svg {
      width: 16px;
      height: 16px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
    }
  `,
})
export class BannerStrip {
  readonly banners = input.required<ShopContentDto['banners']>();
  protected readonly slide = signal(0);
  private readonly track = viewChild<ElementRef<HTMLElement>>('track');

  protected go(step: number): void {
    const element = this.track()?.nativeElement;
    const count = this.banners().length;
    if (!element || count === 0) return;
    const next = (this.slide() + step + count) % count;
    this.slide.set(next);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    element.scrollTo({ left: next * element.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
  }

  protected onScroll(element: HTMLElement): void {
    if (element.clientWidth > 0)
      this.slide.set(Math.round(element.scrollLeft / element.clientWidth));
  }
}
