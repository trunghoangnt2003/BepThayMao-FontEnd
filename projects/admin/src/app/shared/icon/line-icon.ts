import { Component, input } from '@angular/core';

// Icon nét 24px tự vẽ cho khung admin (không lấy từ thư viện bên ngoài).
const shapes = {
  burger: 'M4 7h16M4 12h16M4 17h16',
  home: 'M4 11l8-7 8 7v9H4z',
  orders: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6',
  toggle: 'M7 7h10a5 5 0 0 1 0 10H7A5 5 0 0 1 7 7zM16 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  bowl: 'M3 11h18a9 9 0 0 1-18 0z',
  image:
    'M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM21 16l-5-5-9 9M9 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  store: 'M4 10v10h16V10M3 4h18l-1 6H4z',
  settings: 'M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M16 4v4M10 10v4M18 16v4',
  cash: 'M5 6h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  prohibit: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM5.6 5.6l12.8 12.8',
  check: 'M5 12.5l4.5 4.5L19 7',
  logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
  doc: 'M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5',
  user: 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21a8 8 0 0 1 16 0',
  lock: 'M6 10h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zM8 10V7a4 4 0 0 1 8 0v3',
} as const;

export type LineIconName = keyof typeof shapes;

@Component({
  selector: 'adm-line-icon',
  host: { 'aria-hidden': 'true', class: 'line-icon' },
  template: `<svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    focusable="false"
  >
    <path [attr.d]="shapes[name()]" />
  </svg>`,
  styles: ':host { display: inline-grid; flex: none; }',
})
export class LineIconComponent {
  readonly name = input.required<LineIconName>();
  protected readonly shapes = shapes;
}
