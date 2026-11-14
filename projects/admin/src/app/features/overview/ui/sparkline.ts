import { Component, computed, input } from '@angular/core';

/** Đường vùng nhỏ không trục ở đáy thẻ chỉ số; chỉ trang trí, số đã ghi bằng chữ trong thẻ. */
@Component({
  selector: 'adm-sparkline',
  host: { 'aria-hidden': 'true' },
  template: `<svg viewBox="0 0 300 64" preserveAspectRatio="none" focusable="false">
    <path class="fill" [attr.d]="line() + ' L300 64 L0 64 Z'" />
    <path class="stroke" [attr.d]="line()" vector-effect="non-scaling-stroke" />
  </svg>`,
  styles: `
    :host {
      display: block;
    }
    svg {
      display: block;
      width: 100%;
      height: 64px;
    }
    .fill {
      fill: var(--color-main);
      opacity: 0.14;
    }
    .stroke {
      fill: none;
      stroke: var(--color-main);
      stroke-width: 2;
    }
  `,
})
export class SparklineComponent {
  readonly values = input.required<readonly number[]>();

  protected readonly line = computed(() => {
    const values = this.values().length > 1 ? this.values() : [0, ...this.values(), 0];
    const max = Math.max(...values);
    const min = Math.min(...values);
    return values
      .map((value, index) => {
        const x = (index * 300) / (values.length - 1);
        const y = 58 - ((value - min) / (max - min || 1)) * 44;
        return `${index ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  });
}
