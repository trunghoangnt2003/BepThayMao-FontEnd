import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuDishDto } from '@bepthaymao/api-client';
import { CartStore, formatVnd } from '../../shop/data-access/shop-data';

/** Năm lớp của một suất xôi gà, theo thứ tự lắp từ dưới lên. */
export const STORY_STEPS = [
  { num: '01', name: 'Xôi nếp', text: 'Nếp vàng dẻo, đơm đầy bát.' },
  { num: '02', name: 'Rau thơm, đồ chua', text: 'Mùi tươi, cà rốt và củ cải ngâm.' },
  { num: '03', name: 'Gà luộc', text: 'Thái miếng, da vàng óng.' },
  { num: '04', name: 'Hành phi, lá chanh', text: 'Rắc lên cho giòn và thơm.' },
  { num: '05', name: 'Trứng cút, thịt băm', text: 'Thêm đậm vị cho cả suất.' },
] as const;

/**
 * Suất xôi gà lắp từng lớp: một ảnh thật cắt thành năm lớp bằng mask SVG. Khi animation bật,
 * landing-motion ghim khung và cho từng lớp rơi vào bát kèm chú thích; khi tắt, mọi lớp và chú thích hiện sẵn.
 */
@Component({
  selector: 'cus-landing-story',
  imports: [RouterLink],
  template: `
    <div class="xr">
      <h2 id="story-h" class="xr__h">Một suất xôi gà, lắp từng lớp</h2>
      <div class="art">
        <svg
          viewBox="0 0 1024 683"
          role="img"
          aria-label="Suất xôi gà: xôi nếp, rau thơm và đồ chua, gà luộc, hành phi, trứng cút và thịt băm"
        >
          <defs>
            <image
              id="story-ph"
              [attr.href]="image()"
              width="1024"
              height="683"
              preserveAspectRatio="none"
            />
            <clipPath id="story-clip"><rect width="1024" height="683" rx="28" /></clipPath>
            <filter id="story-fe" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
            <filter id="story-blur" x="0" y="0" width="100%" height="100%">
              <feGaussianBlur stdDeviation="12" edgeMode="duplicate" />
              <feColorMatrix type="saturate" values=".75" />
            </filter>
            <mask id="story-m1">
              <g filter="url(#story-fe)">
                <ellipse
                  fill="#fff"
                  cx="402"
                  cy="250"
                  rx="318"
                  ry="174"
                  transform="rotate(5 402 250)"
                />
                <path
                  fill="#000"
                  d="M150 196 L330 126 L460 168 L518 262 L528 326 L466 392 L380 420 L276 412 L186 340 L140 266Z"
                />
                <ellipse fill="#000" cx="510" cy="132" rx="140" ry="70" />
                <ellipse
                  fill="#000"
                  cx="612"
                  cy="252"
                  rx="100"
                  ry="72"
                  transform="rotate(25 612 252)"
                />
              </g>
            </mask>
            <mask id="story-m2">
              <g filter="url(#story-fe)">
                <ellipse fill="#fff" cx="510" cy="128" rx="150" ry="78" />
                <ellipse
                  fill="#fff"
                  cx="612"
                  cy="250"
                  rx="112"
                  ry="82"
                  transform="rotate(25 612 250)"
                />
                <circle fill="#000" cx="640" cy="314" r="46" />
                <circle fill="#000" cx="516" cy="392" r="44" />
                <ellipse fill="#000" cx="575" cy="356" rx="66" ry="52" />
              </g>
            </mask>
            <mask id="story-m3">
              <g filter="url(#story-fe)">
                <path
                  fill="#fff"
                  d="M128 186 L330 112 L470 160 L528 262 L540 330 L470 400 L380 432 L270 424 L172 346 L118 262Z"
                />
                <ellipse
                  fill="#000"
                  cx="392"
                  cy="212"
                  rx="128"
                  ry="80"
                  transform="rotate(12 392 212)"
                />
                <ellipse fill="#000" cx="575" cy="356" rx="66" ry="52" />
                <circle fill="#000" cx="516" cy="392" r="44" />
              </g>
            </mask>
            <mask id="story-m4">
              <ellipse
                fill="#fff"
                filter="url(#story-fe)"
                cx="392"
                cy="212"
                rx="138"
                ry="90"
                transform="rotate(12 392 212)"
              />
            </mask>
            <mask id="story-m5">
              <g filter="url(#story-fe)">
                <circle fill="#fff" cx="640" cy="314" r="48" />
                <circle fill="#fff" cx="516" cy="392" r="46" />
                <ellipse fill="#fff" cx="575" cy="356" rx="70" ry="56" />
              </g>
            </mask>
          </defs>
          <g clip-path="url(#story-clip)">
            <use href="#story-ph" filter="url(#story-blur)" />
            <rect class="veil" width="1024" height="683" />
            <g class="ly"><use href="#story-ph" mask="url(#story-m1)" /></g>
            <g class="ly"><use href="#story-ph" mask="url(#story-m2)" /></g>
            <g class="ly"><use href="#story-ph" mask="url(#story-m3)" /></g>
            <g class="ly"><use href="#story-ph" mask="url(#story-m4)" /></g>
            <g class="ly"><use href="#story-ph" mask="url(#story-m5)" /></g>
            <g class="steam">
              <use href="#story-ph" />
              <g transform="translate(255 -150) scale(2.2)">
                <path d="M28 140 c-12 -18 12 -30 0 -48 c-12 -18 12 -30 0 -48" />
                <path d="M60 132 c-12 -18 12 -30 0 -48 c-12 -18 12 -30 0 -48" />
                <path d="M92 140 c-12 -18 12 -30 0 -48 c-12 -18 12 -30 0 -48" />
              </g>
            </g>
          </g>
        </svg>
      </div>
      <ol class="caps">
        @for (step of steps; track step.num) {
          <li class="cap">
            <b>{{ step.num }}</b>
            <strong>{{ step.name }}</strong>
            <span>{{ step.text }}</span>
          </li>
        }
        <li class="cap cap--final">
          @if (dish(); as d) {
            <strong>{{ d.name }}</strong>
            <span class="num">{{ formatVnd(d.price) }}</span>
            <button class="btn btn--gold" type="button" (click)="add(d)">Thêm vào giỏ</button>
          } @else {
            <strong>Xôi gà</strong>
            <span>Nóng hổi, gói lá chuối</span>
            <a class="btn btn--gold" routerLink="/dat-mon">Đặt món ngay</a>
          }
        </li>
      </ol>
      <p class="visually-hidden" role="status">{{ added() }}</p>
    </div>
  `,
  styleUrl: './landing-story.css',
})
export class LandingStory {
  readonly dish = input<MenuDishDto | null>(null);
  readonly image = input.required<string>();
  protected readonly steps = STORY_STEPS;
  protected readonly formatVnd = formatVnd;
  protected readonly added = signal('');
  private readonly cart = inject(CartStore);

  protected add(dish: MenuDishDto): void {
    this.cart.set(dish, this.cart.quantityOf(dish.id) + 1);
    this.added.set(`Đã thêm ${dish.name} vào giỏ`);
  }
}
