import { Component, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ShopContentDto } from '@bepthaymao/api-client';

/**
 * Banner chủ quán cài, theo bản thử: ảnh món bên phải, nền đỏ mận phủ dần, tiêu đề vàng nghiêng, nút "Đặt món ngay".
 * Không tự chạy; vuốt ngang hoặc bấm chấm. Banner gắn món thì nút mở món, không gắn thì cuộn tới danh sách món.
 */
@Component({
  selector: 'cus-banner-strip',
  imports: [RouterLink],
  template: `
    <section class="hb-car" aria-roledescription="carousel" aria-label="Món nổi bật">
      <div class="hb-slides" #track tabindex="0" (scroll)="onScroll(track)">
        @for (banner of banners(); track banner.id; let index = $index) {
          <div
            class="hb"
            role="group"
            aria-roledescription="slide"
            [attr.aria-label]="index + 1 + ' / ' + banners().length"
          >
            <div class="hb-card">
              @if (banner.imageUrl; as src) {
                <img
                  class="photo"
                  [src]="src"
                  alt=""
                  decoding="async"
                  [attr.loading]="index === 0 ? 'eager' : 'lazy'"
                />
              }
              <span class="hb-shade" aria-hidden="true"></span>
              <svg class="hb-steam" viewBox="0 0 120 90" aria-hidden="true">
                <path d="M30 86c-10-14 10-24 0-38s10-24 0-38" />
                <path d="M60 80c-10-14 10-24 0-38s10-24 0-38" />
                <path d="M90 86c-10-14 10-24 0-38s10-24 0-38" />
              </svg>
              <div class="hb-tx">
                <h2 class="hb-t">{{ banner.title }}</h2>
                <span class="hb-sw" aria-hidden="true"></span>
                @if (banner.body) {
                  <p>{{ banner.body }}</p>
                }
                @if (banner.linkDishId) {
                  <a class="hb-cta" [routerLink]="['/mon', banner.linkDishId]">Đặt món ngay</a>
                } @else {
                  <button class="hb-cta" type="button" (click)="browse.emit()">Đặt món ngay</button>
                }
              </div>
            </div>
          </div>
        }
      </div>
      @if (banners().length > 1) {
        <div class="dots">
          @for (banner of banners(); track banner.id; let index = $index) {
            <button
              type="button"
              [attr.aria-label]="'Banner ' + (index + 1)"
              [attr.aria-current]="slide() === index"
              (click)="go(index)"
            ></button>
          }
        </div>
      }
    </section>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
      max-width: 100%;
    }
    .hb-car {
      margin: 6px 0 8px;
    }
    .hb-slides {
      display: flex;
      gap: 12px;
      padding: 4px 0 30px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
    }
    .hb {
      position: relative;
      display: grid;
      flex: 0 0 100%;
      scroll-snap-align: start;
    }
    .hb-card {
      position: relative;
      display: grid;
      align-items: center;
      min-height: 224px;
      overflow: hidden;
      border-radius: 24px;
      background: #7b1725;
      box-shadow: 0 10px 20px rgb(53 21 26 / 0.3);
    }
    .photo {
      position: absolute;
      top: 0;
      right: -6%;
      width: 76%;
      height: 100%;
      object-fit: cover;
      object-position: 42% 50%;
    }
    .hb-shade {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        #8f1c2c 0%,
        #7b1725 40%,
        rgb(123 23 37 / 0.8) 52%,
        transparent 70%
      );
    }
    .hb-steam {
      position: absolute;
      z-index: 1;
      top: 2%;
      right: 26%;
      width: 22%;
      pointer-events: none;
    }
    .hb-steam path {
      fill: none;
      stroke: rgb(255 255 255 / 0.75);
      stroke-width: 5;
      stroke-linecap: round;
      opacity: 0;
    }
    :host-context(.anim) .hb-steam path {
      animation: steam 2.8s ease-in infinite;
    }
    :host-context(.anim) .hb-steam path:nth-child(2) {
      animation-delay: 0.9s;
    }
    :host-context(.anim) .hb-steam path:nth-child(3) {
      animation-delay: 1.8s;
    }
    @keyframes steam {
      0% {
        transform: translateY(14px);
        opacity: 0;
      }
      30% {
        opacity: 0.85;
      }
      100% {
        transform: translateY(-26px);
        opacity: 0;
      }
    }
    .hb-tx {
      position: relative;
      z-index: 2;
      display: grid;
      justify-items: start;
      gap: 6px;
      min-width: 0;
      max-width: 60%;
      padding: 24px 0 24px 22px;
    }
    .hb-t {
      min-width: 0;
      margin: 0;
      overflow-wrap: break-word;
      color: #d7ad62;
      font:
        italic 700 clamp(28px, 8.4vw, 52px) / 1.05 'Noto Serif',
        Georgia,
        serif;
      text-wrap: balance;
    }
    .hb-sw {
      width: 70%;
      height: 3px;
      border-radius: 3px;
      background: linear-gradient(90deg, #d7ad62, transparent);
    }
    .hb-tx p {
      margin: 0;
      color: #fff;
      font-size: 14px;
      line-height: 1.4;
    }
    .hb-cta {
      display: inline-flex;
      align-items: center;
      min-height: 48px;
      margin-top: 8px;
      padding: 0 20px;
      border: 0;
      border-radius: 999px;
      background: linear-gradient(180deg, #e6c27e, #d7ad62);
      box-shadow: 0 6px 14px rgb(53 21 26 / 0.3);
      color: #392817;
      font: 800 15px var(--font-body);
      text-decoration: none;
      cursor: pointer;
    }
    .hb-cta:focus-visible {
      outline: 2px solid #fff;
      outline-offset: 3px;
    }
    .dots {
      display: flex;
      justify-content: center;
      gap: 6px;
      margin-top: -10px;
    }
    .dots button {
      display: grid;
      place-items: center;
      width: 28px;
      height: 28px;
      padding: 0;
      border: 0;
      background: none;
      cursor: pointer;
    }
    .dots button::before {
      content: '';
      width: 10px;
      height: 10px;
      border-radius: 5px;
      background: #ddcfc1;
    }
    .dots button[aria-current='true']::before {
      width: 22px;
      background: #7b1725;
    }
    @media (min-width: 56.25rem) {
      .hb-card {
        min-height: 330px;
      }
      .photo {
        right: -2%;
        width: 62%;
      }
      .hb-tx {
        max-width: 52%;
        padding-left: 56px;
      }
      .hb-tx p {
        font-size: 17px;
      }
    }
  `,
})
export class BannerStrip {
  readonly banners = input.required<ShopContentDto['banners']>();
  /** Banner không gắn món: nút "Đặt món ngay" nhờ trang cuộn tới danh sách món. */
  readonly browse = output();
  protected readonly slide = signal(0);
  private readonly track = viewChild<ElementRef<HTMLElement>>('track');

  protected go(index: number): void {
    const element = this.track()?.nativeElement;
    if (!element) return;
    this.slide.set(index);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    element.scrollTo({ left: index * this.pitch(element), behavior: reduce ? 'auto' : 'smooth' });
  }

  protected onScroll(element: HTMLElement): void {
    const pitch = this.pitch(element);
    if (pitch > 0) this.slide.set(Math.round(element.scrollLeft / pitch));
  }

  /** Bước giữa hai slide = bề rộng slide + khoảng cách (gap), lấy từ vị trí thật. */
  private pitch(element: HTMLElement): number {
    const [first, second] = [element.children[0], element.children[1]] as (
      HTMLElement | undefined
    )[];
    return first && second ? second.offsetLeft - first.offsetLeft : element.clientWidth;
  }
}
