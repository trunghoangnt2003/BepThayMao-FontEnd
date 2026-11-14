import { Component, computed, input } from '@angular/core';
import { percent } from '../data-access/overview-model';

const RING = 2 * Math.PI * 64;

/** Tỉ lệ đơn đã thanh toán hôm nay; số ghi bằng chữ cạnh vòng. */
@Component({
  selector: 'adm-paid-ring',
  template: `
    <div class="ring-wrap">
      <svg class="ring" viewBox="0 0 168 168" role="img" [attr.aria-label]="summary()">
        <circle class="ring__track" cx="84" cy="84" r="64" />
        @if (paid() > 0) {
          <circle
            class="ring__val"
            cx="84"
            cy="84"
            r="64"
            [attr.stroke-dasharray]="ring"
            [attr.stroke-dashoffset]="offset()"
          />
        }
        <text x="84" y="88" text-anchor="middle" class="ring__pct">{{ pct() }}%</text>
        <text x="84" y="110" text-anchor="middle" class="ring__sub">
          {{ paid() }} trên {{ total() }} đơn
        </text>
      </svg>
      <dl class="ring-legend">
        <div>
          <dt><i class="sw sw--main"></i>Đã thanh toán</dt>
          <dd>{{ paid() }}</dd>
        </div>
        <div>
          <dt><i class="sw sw--tint"></i>Chờ hoặc đã hủy</dt>
          <dd>{{ total() - paid() }}</dd>
        </div>
      </dl>
    </div>
  `,
  styleUrl: './paid-ring.css',
})
export class PaidRingComponent {
  readonly paid = input.required<number>();
  readonly total = input.required<number>();
  protected readonly ring = RING;
  protected readonly pct = computed(() => percent(this.paid(), this.total()));
  protected readonly offset = computed(() => RING * (1 - this.pct() / 100));
  protected readonly summary = computed(
    () =>
      `${String(this.paid())} trên ${String(this.total())} đơn đã thanh toán, ${String(this.pct())} phần trăm`,
  );
}
