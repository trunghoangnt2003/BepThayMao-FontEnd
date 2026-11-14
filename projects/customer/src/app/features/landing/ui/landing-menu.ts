import { Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuDishDto } from '@bepthaymao/api-client';
import { CATEGORY_LABELS, CATEGORY_ORDER, formatVnd } from '../../shop/data-access/shop-data';
import { DishThumb } from '../../shop/ui/shop-ui';

/** Thực đơn kiểu nhà hàng: tên món, đường chấm, giá; rê hoặc focus tên món thì ảnh bên cạnh đổi theo. */
@Component({
  selector: 'cus-landing-menu',
  imports: [RouterLink, DishThumb],
  template: `
    <div class="wrap">
      @if (shown(); as dish) {
        <figure class="preview" aria-hidden="true">
          <cus-dish-thumb
            [name]="dish.name"
            [category]="dish.category"
            [imageUrl]="dish.imageUrl"
          />
          <figcaption>
            <b>{{ dish.name }}</b
            ><span class="num">{{ formatVnd(dish.price) }}</span>
          </figcaption>
        </figure>
      }
      <div class="groups">
        @for (group of groups(); track group.value) {
          <section [attr.aria-labelledby]="'lm-' + group.value">
            <h3 [id]="'lm-' + group.value">{{ group.label }}</h3>
            <ul>
              @for (dish of group.dishes; track dish.id) {
                <li>
                  <a
                    [routerLink]="['/mon', dish.id]"
                    (mouseenter)="active.set(dish)"
                    (focus)="active.set(dish)"
                  >
                    <b>{{ dish.name }}</b
                    ><i aria-hidden="true"></i><span class="num">{{ formatVnd(dish.price) }}</span>
                    @if (dish.description) {
                      <small>{{ dish.description }}</small>
                    }
                  </a>
                </li>
              }
            </ul>
          </section>
        }
      </div>
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: var(--space-xl);
    }
    .preview {
      position: sticky;
      top: var(--space-lg);
      align-self: start;
      display: grid;
      gap: var(--space-sm);
      margin: 0;
    }
    .preview cus-dish-thumb {
      aspect-ratio: 4 / 5;
      border-radius: var(--radius-panel);
    }
    figcaption {
      display: flex;
      justify-content: space-between;
      gap: var(--space-sm);
      font-weight: var(--weight-heavy);
    }
    figcaption span {
      color: var(--color-accent);
    }
    .groups {
      display: grid;
      gap: var(--space-xl);
    }
    h3 {
      padding-bottom: var(--space-sm);
      border-bottom: 1.5px solid var(--color-rule-2);
      color: var(--color-accent);
      font-size: 0.8125rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    a {
      display: grid;
      grid-template-columns: auto minmax(var(--space-md), 1fr) auto;
      align-items: baseline;
      gap: var(--space-sm);
      padding-block: var(--space-md);
      border-bottom: 1px solid var(--color-rule);
      color: var(--color-ink);
      text-decoration: none;
    }
    a b {
      font-size: 1.25rem;
      font-weight: var(--weight-heavy);
      transition: color 250ms var(--ease-out);
    }
    a:hover b,
    a:focus-visible b {
      color: var(--color-accent);
    }
    i {
      border-bottom: 2px dotted var(--color-rule-2);
    }
    a span {
      font-weight: var(--weight-heavy);
    }
    small {
      grid-column: 1 / -1;
      color: var(--color-muted);
      font-size: var(--text-sm);
    }
    @media (max-width: 47.99rem) {
      .preview {
        display: none;
      }
    }
    @media (min-width: 48rem) {
      .wrap {
        grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
      }
    }
  `,
})
export class LandingMenu {
  readonly menu = input.required<readonly MenuDishDto[]>();
  protected readonly formatVnd = formatVnd;
  protected readonly active = signal<MenuDishDto | null>(null);
  protected readonly shown = computed(
    () => this.active() ?? this.menu().find((dish) => dish.isFeatured) ?? this.menu().at(0) ?? null,
  );
  protected readonly groups = computed(() =>
    CATEGORY_ORDER.map((value) => ({
      value,
      label: CATEGORY_LABELS[value],
      dishes: this.menu().filter((dish) => dish.category === value),
    })).filter((group) => group.dishes.length > 0),
  );
}
