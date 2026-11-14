import { isPlatformBrowser } from '@angular/common';
import { Component, computed, DestroyRef, inject, input, PLATFORM_ID, signal } from '@angular/core';

const STEPS = ['Đang đồ xôi…', 'Đang thêm nhân…', 'Sắp xong rồi…'] as const;

/**
 * Loader tối giản sang trọng: bát xôi nét đồng thau tự vẽ, mặt xôi chấm hạt, khói vẽ dần lên, vòng cung quay chậm
 * và ba hạt nếp bay quanh. Màu nét lấy từ --loader-ink (mặc định màu nhấn), nên dùng được trên nền sáng lẫn nền cacao.
 * Hình chỉ trang trí (aria-hidden); trình đọc màn hình nghe nhãn qua role="status".
 */
@Component({
  selector: 'cus-kitchen-loader',
  host: { role: 'status', '[class.compact]': "size() === 'sm'" },
  template: `
    <svg viewBox="0 0 160 160" aria-hidden="true" focusable="false">
      <circle class="track" cx="80" cy="80" r="62" />
      <circle class="arc" cx="80" cy="80" r="62" pathLength="100" />
      <g class="orbit o1"><circle cx="80" cy="18" r="2.6" /></g>
      <g class="orbit o2"><circle cx="80" cy="18" r="2" /></g>
      <g class="orbit o3"><ellipse cx="80" cy="18" rx="3" ry="1.6" /></g>
      <g class="steam">
        <path pathLength="100" d="M66 64c-6-8 6-12 0-22" />
        <path pathLength="100" d="M80 60c-6-8 6-12 0-24" />
        <path pathLength="100" d="M94 64c-6-8 6-12 0-22" />
      </g>
      <path class="rice" d="M54 86c6-18 46-18 52 0" />
      <path class="bowl" pathLength="100" d="M44 88h72c-2 20-16 30-36 30s-34-10-36-30z" />
      <path class="foot" pathLength="100" d="M66 118l4 8h20l4-8" />
    </svg>
    <span class="label">{{ text() }}</span>
    <span class="brand">Bếp Thầy Mão</span>
  `,
  styles: `
    :host {
      --ink: var(--loader-ink, var(--color-accent));
      display: grid;
      justify-items: center;
      gap: 6px;
      padding: var(--space-md);
      color: var(--ink);
    }
    svg {
      width: 150px;
      height: auto;
      overflow: visible;
    }
    :host(.compact) svg {
      width: 84px;
    }
    :host(.compact) .brand {
      display: none;
    }
    .track {
      fill: none;
      stroke: var(--ink);
      stroke-width: 1;
      opacity: 0.22;
    }
    .arc {
      fill: none;
      stroke: var(--ink);
      stroke-width: 2;
      stroke-linecap: round;
      stroke-dasharray: 22 78;
      transform-origin: 80px 80px;
      animation: spin 2.4s cubic-bezier(0.6, 0.1, 0.4, 0.9) infinite;
    }
    .orbit {
      fill: var(--ink);
      transform-origin: 80px 80px;
      animation: spin 3.6s linear infinite;
    }
    .o2 {
      opacity: 0.7;
      animation-duration: 5.2s;
      animation-direction: reverse;
    }
    .o3 {
      opacity: 0.5;
      animation-duration: 7s;
    }
    .steam path {
      fill: none;
      stroke: var(--ink);
      stroke-width: 1.6;
      stroke-linecap: round;
      stroke-dasharray: 100;
      animation: rise 2.4s ease-in-out infinite;
    }
    .steam path:nth-child(2) {
      animation-delay: 0.4s;
    }
    .steam path:nth-child(3) {
      animation-delay: 0.8s;
    }
    .rice {
      fill: none;
      stroke: var(--ink);
      stroke-width: 3;
      stroke-linecap: round;
      stroke-dasharray: 0.1 6;
      animation: shimmer 2.4s ease-in-out infinite;
    }
    .bowl,
    .foot {
      fill: none;
      stroke: var(--ink);
      stroke-width: 1.8;
      stroke-linejoin: round;
      stroke-linecap: round;
      stroke-dasharray: 100;
      animation: draw 2.4s cubic-bezier(0.65, 0, 0.35, 1) infinite;
    }
    .foot {
      animation-delay: 0.3s;
    }
    .label {
      font-family: var(--font-accent);
      font-style: italic;
      font-weight: 600;
      font-size: 1.375rem;
      letter-spacing: 0;
      color: var(--ink);
    }
    :host(.compact) .label {
      font-size: 1.125rem;
    }
    .brand {
      font-size: 0.625rem;
      font-weight: var(--weight-strong);
      letter-spacing: 0.32em;
      text-transform: uppercase;
      opacity: 0.7;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    @keyframes draw {
      0% {
        stroke-dashoffset: 100;
      }
      45%,
      70% {
        stroke-dashoffset: 0;
        opacity: 1;
      }
      100% {
        stroke-dashoffset: 0;
        opacity: 0.25;
      }
    }
    @keyframes rise {
      0% {
        stroke-dashoffset: 100;
        opacity: 0;
        transform: translateY(6px);
      }
      40% {
        opacity: 0.9;
      }
      100% {
        stroke-dashoffset: -100;
        opacity: 0;
        transform: translateY(-8px);
      }
    }
    @keyframes shimmer {
      50% {
        opacity: 0.45;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .arc,
      .orbit,
      .steam path,
      .rice,
      .bowl,
      .foot {
        animation: none;
        stroke-dashoffset: 0;
      }
    }
  `,
})
export class KitchenLoader {
  /** Nhãn cố định; bỏ trống thì đổi lần lượt các bước nấu. */
  readonly label = input<string>('');
  readonly size = input<'sm' | 'lg'>('lg');
  private readonly step = signal(0);
  protected readonly text = computed(() => this.label() || STEPS[this.step() % STEPS.length]);

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    const timer = setInterval(() => {
      this.step.update((value) => value + 1);
    }, 1600);
    inject(DestroyRef).onDestroy(() => {
      clearInterval(timer);
    });
  }
}
