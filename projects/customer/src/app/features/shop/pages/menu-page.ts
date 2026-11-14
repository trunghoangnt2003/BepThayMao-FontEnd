import { Component, computed, inject, input } from '@angular/core';
import { MenuDishDto } from '@bepthaymao/api-client';
import { PageMeta } from '../../../shared/seo/page-meta';
import { CATEGORY_LABELS, CATEGORY_ORDER, Loaded } from '../data-access/shop-data';
import { CartBar, DishRow } from '../ui/shop-ui';

@Component({
  selector: 'cus-menu-page',
  imports: [DishRow, CartBar],
  template: `
    <header class="head">
      <h1 tabindex="-1">Thực đơn</h1>
      <p>Thực đơn chung của quán. Bạn chọn cơ sở gần nhất ở bước đặt hàng.</p>
    </header>
    @let state = menu();
    @if (state.kind === 'error') {
      <section class="card">
        <h2>Không tải được thực đơn</h2>
        <p>Kiểm tra kết nối mạng rồi tải lại trang.</p>
        <a class="btn" href="/thuc-don">Tải lại trang</a>
      </section>
    } @else {
      <nav class="tabs" aria-label="Nhóm món">
        @for (group of groups(); track group.value) {
          <a [href]="'#' + group.value">{{ group.label }}</a>
        }
      </nav>
      @for (group of groups(); track group.value) {
        <section class="card" [id]="group.value" [attr.aria-labelledby]="group.value + '-h'">
          <h2 [id]="group.value + '-h'">{{ group.label }}</h2>
          @for (dish of group.dishes; track dish.id; let index = $index) {
            <cus-dish-row class="fx-in" [style.--i]="index" [dish]="dish" />
          }
        </section>
      } @empty {
        <section class="card">
          <h2>Quán chưa có món nào</h2>
          <p>Thực đơn đang được cập nhật. Hãy quay lại sau.</p>
        </section>
      }
      <cus-cart-bar />
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--space-sm);
    }
    .head {
      display: grid;
      gap: var(--space-2xs);
    }
    .head p {
      color: var(--color-ink-2);
    }
    .tabs {
      position: sticky;
      top: 0;
      z-index: var(--z-raised);
      display: flex;
      gap: var(--space-lg);
      overflow-x: auto;
      padding-inline: var(--space-md);
      background: var(--color-paper-2);
      border-radius: var(--radius-card);
      box-shadow: var(--shadow-card);
    }
    .tabs a {
      flex: none;
      display: inline-flex;
      align-items: center;
      min-height: 48px;
      color: var(--color-ink-2);
      font-weight: var(--weight-strong);
      text-decoration: none;
    }
    .tabs a:hover {
      color: var(--color-accent);
    }
    .card {
      display: grid;
      padding: var(--space-md);
      border-radius: var(--radius-panel);
      background: var(--color-paper-2);
      box-shadow: var(--shadow-card);
      scroll-margin-top: 64px;
    }
    .card h2 {
      font-size: var(--text-lg);
      margin-bottom: var(--space-2xs);
    }
  `,
})
export class MenuPage {
  readonly menu = input.required<Loaded<readonly MenuDishDto[]>>();
  protected readonly groups = computed(() => {
    const state = this.menu();
    if (state.kind !== 'loaded') return [];
    return CATEGORY_ORDER.map((value) => ({
      value,
      label: CATEGORY_LABELS[value],
      dishes: state.value.filter((dish) => dish.category === value),
    })).filter((group) => group.dishes.length > 0);
  });

  constructor() {
    inject(PageMeta).set({
      title: 'Thực đơn',
      description:
        'Thực đơn xôi của Bếp Thầy Mão: xôi mặn, xôi ngọt, xôi chay. Giá như nhau ở mọi cơ sở.',
      path: '/thuc-don',
    });
  }
}
