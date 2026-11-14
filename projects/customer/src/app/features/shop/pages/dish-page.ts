import { DOCUMENT, Location } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MenuDishDetailDto } from '@bepthaymao/api-client';
import { PageMeta } from '../../../shared/seo/page-meta';
import { CartStore, CATEGORY_LABELS, formatVnd, Loaded } from '../data-access/shop-data';
import { DishThumb } from '../ui/shop-ui';

@Component({
  selector: 'cus-dish-page',
  imports: [RouterLink, DishThumb],
  template: `
    @let state = dish();
    @if (state.kind === 'error') {
      <section class="card">
        <h1 tabindex="-1">Không tìm thấy món</h1>
        <p>Món này không còn trong thực đơn.</p>
        <a class="btn" routerLink="/thuc-don">Xem thực đơn</a>
      </section>
    } @else {
      @let value = state.value;
      <div class="hero fx-in">
        <button type="button" class="back" (click)="back()">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
          Quay lại
        </button>
        <cus-dish-thumb
          [name]="value.name"
          [category]="value.category"
          [imageUrl]="value.imageUrl"
        />
        @if (value.isFeatured) {
          <span class="tag">Quán giới thiệu</span>
        }
      </div>
      <article class="body">
        <div class="title">
          <h1 tabindex="-1">{{ value.name }}</h1>
          <p class="price num">{{ formatVnd(value.price) }}</p>
        </div>
        <p class="chip">{{ categoryLabel() }}</p>
        @if (value.description) {
          <section aria-labelledby="desc-h">
            <h2 id="desc-h">Mô tả</h2>
            <p class="muted">{{ value.description }}</p>
          </section>
        }
        <section aria-labelledby="branches-h">
          <h2 id="branches-h">Có ở cơ sở</h2>
          <ul class="branches">
            @for (branch of value.branches; track branch.branchId) {
              <li>
                <span>{{ branch.name }}</span>
                <span [class.ok]="branch.isAvailable" class="state">
                  {{
                    branch.isAvailable
                      ? branch.isOpenNow
                        ? 'Còn món'
                        : 'Còn món, ngoài giờ'
                      : 'Hết món'
                  }}
                </span>
              </li>
            }
          </ul>
          <p class="muted">Bạn chọn cơ sở ở bước đặt hàng.</p>
        </section>
        <div class="add">
          <span class="stepper" role="group" [attr.aria-label]="'Số lượng ' + value.name">
            <button
              type="button"
              (click)="qty.set(qty() - 1)"
              [disabled]="qty() <= 1"
              aria-label="Bớt một phần"
            >
              −
            </button>
            <span class="num">{{ qty() }}</span>
            <button
              type="button"
              (click)="qty.set(qty() + 1)"
              [disabled]="qty() >= 99"
              aria-label="Thêm một phần"
            >
              +
            </button>
          </span>
          <button type="button" class="btn btn--primary" (click)="add(value)">
            {{ added() ? 'Đã thêm vào giỏ' : 'Thêm vào giỏ' }}
            <span class="num">{{ formatVnd(value.price * qty()) }}</span>
          </button>
        </div>
        <p class="visually-hidden" role="status">
          {{ added() ? 'Đã thêm ' + value.name + ' vào giỏ.' : '' }}
        </p>
      </article>
    }
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
    }
    .hero {
      position: relative;
      max-width: 28rem;
      width: 100%;
      justify-self: center;
    }
    .hero cus-dish-thumb {
      border-radius: var(--radius-panel);
    }
    .back {
      position: absolute;
      z-index: 1;
      top: var(--space-sm);
      left: var(--space-sm);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      min-height: 44px;
      padding: 0 16px 0 10px;
      border: 0;
      border-radius: var(--radius-pill);
      background: oklch(22% 0.03 50 / 0.6);
      color: var(--on-cocoa);
      font: inherit;
      font-size: var(--text-sm);
      font-weight: var(--weight-strong);
      backdrop-filter: blur(8px);
      cursor: pointer;
    }
    .back svg {
      width: 18px;
      height: 18px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2.2;
    }
    .tag {
      position: absolute;
      left: var(--space-md);
      bottom: 40px;
      padding: 2px var(--space-sm);
      border-radius: var(--radius-pill);
      background: var(--xoi-man);
      color: var(--color-ink);
      font-size: var(--text-sm);
      font-weight: var(--weight-strong);
      box-shadow: var(--shadow-card);
    }
    .body {
      position: relative;
      display: grid;
      gap: var(--space-lg);
      max-width: 40rem;
      width: 100%;
      justify-self: center;
      margin-top: calc(-1 * var(--space-lg));
      padding: var(--space-lg) var(--space-md);
      border-radius: var(--radius-panel) var(--radius-panel) 0 0;
      background: var(--color-paper-2);
    }
    .title {
      display: grid;
      gap: var(--space-2xs);
    }
    .price {
      color: var(--color-accent);
      font-size: var(--text-lg);
      font-weight: var(--weight-heavy);
    }
    .chip {
      justify-self: start;
      padding: 4px var(--space-sm);
      border-radius: var(--radius-pill);
      background: var(--color-tint);
      font-size: var(--text-sm);
      font-weight: var(--weight-strong);
    }
    h2 {
      font-size: var(--text-md);
      margin-bottom: var(--space-2xs);
    }
    .muted {
      color: var(--color-ink-2);
      font-size: var(--text-sm);
    }
    .branches {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .branches li {
      display: flex;
      justify-content: space-between;
      gap: var(--space-sm);
      min-height: 40px;
      align-items: center;
      border-top: var(--rule-hair) solid var(--color-rule);
      font-size: var(--text-sm);
    }
    .state {
      color: var(--color-muted);
      font-weight: var(--weight-strong);
    }
    .state.ok {
      color: var(--color-success);
    }
    .add {
      position: sticky;
      bottom: calc(var(--space-sm) + env(safe-area-inset-bottom, 0px));
      z-index: var(--z-sticky);
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      padding: var(--space-xs);
      border-radius: var(--radius-pill);
      background: var(--color-paper-2);
      box-shadow:
        0 0 0 12px var(--color-paper-2),
        var(--shadow-lift);
    }
    .add .btn {
      flex: 1;
      min-width: 0;
      padding-inline: var(--space-md);
      font-size: 0.9375rem;
    }
    .stepper {
      display: inline-flex;
      align-items: center;
      border-radius: var(--radius-pill);
      background: var(--color-paper);
    }
    .stepper button {
      width: 44px;
      height: 48px;
      border: 0;
      border-radius: var(--radius-pill);
      background: transparent;
      color: var(--color-ink);
      font-size: var(--text-lg);
      cursor: pointer;
    }
    .stepper button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `,
})
export class DishPage {
  readonly dish = input.required<Loaded<MenuDishDetailDto>>();
  private readonly cart = inject(CartStore);
  private readonly meta = inject(PageMeta);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly document = inject(DOCUMENT);
  protected readonly formatVnd = formatVnd;
  protected readonly qty = signal(1);
  protected readonly added = signal(false);
  protected readonly categoryLabel = computed(() => {
    const state = this.dish();
    return state.kind === 'loaded' ? CATEGORY_LABELS[state.value.category] : '';
  });

  constructor() {
    effect(() => {
      const state = this.dish();
      if (state.kind === 'loaded')
        this.meta.set({
          title: state.value.name,
          description: state.value.description ?? `${state.value.name} của Bếp Thầy Mão.`,
          path: `/mon/${state.value.id}`,
        });
    });
  }

  /** Đến từ trang khác trong app thì quay lại đúng chỗ (giữ vị trí cuộn); mở thẳng link món thì về trang đặt món. */
  protected back(): void {
    const state: unknown = this.document.defaultView?.history.state;
    const id: unknown =
      state && typeof state === 'object' ? Reflect.get(state, 'navigationId') : null;
    if (typeof id === 'number' && id > 1) {
      this.location.back();
      return;
    }
    void this.router.navigateByUrl('/dat-mon');
  }

  protected add(value: MenuDishDetailDto): void {
    this.cart.set(value, this.cart.quantityOf(value.id) + this.qty());
    this.added.set(true);
    this.qty.set(1);
    setTimeout(() => {
      this.added.set(false);
    }, 1500);
  }
}
