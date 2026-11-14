import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrderStatus, OrderTrackingDto } from '@bepthaymao/api-client';
import { toApiError } from '@bepthaymao/core';
import { PageMeta } from '../../../shared/seo/page-meta';
import { OrderApi } from '../data-access/order-api';
import { CartStore, formatVnd } from '../data-access/shop-data';
import { KitchenLoader } from '../../../shared/loader/kitchen-loader';

const STATUS_LABELS: Record<OrderStatus, string> = {
  PendingPayment: 'Chờ thanh toán',
  Paid: 'Đã thanh toán, chờ nhận đơn',
  Accepted: 'Cơ sở đã nhận đơn',
  Preparing: 'Đang chuẩn bị',
  Delivering: 'Đang giao',
  Completed: 'Đã hoàn thành',
  Cancelled: 'Đã hủy',
};
const STEPS: readonly OrderStatus[] = [
  'PendingPayment',
  'Paid',
  'Accepted',
  'Preparing',
  'Delivering',
];

@Component({
  selector: 'cus-order-page',
  imports: [ReactiveFormsModule, RouterLink, KitchenLoader],
  templateUrl: './order-page.html',
  styleUrl: './order-page.css',
})
export class OrderPage implements OnInit {
  readonly code = input.required<string>();
  private readonly api = inject(OrderApi);
  private readonly cart = inject(CartStore);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly destroyRef = inject(DestroyRef);
  protected readonly formatVnd = formatVnd;
  protected readonly labels = STATUS_LABELS;
  protected readonly tracking = signal<OrderTrackingDto | null>(null);
  protected readonly state = signal<'loading' | 'ask-phone' | 'not-found' | 'error' | 'ready'>(
    'loading',
  );
  protected readonly now = signal(Date.now());
  protected readonly copied = signal<string | null>(null);
  protected readonly confirmCancel = signal(false);
  protected readonly cancelError = signal<string | null>(null);
  protected readonly phoneForm = inject(NonNullableFormBuilder).group({ phone: [''] });
  private phone = '';

  protected readonly remaining = computed(() => {
    const expires = this.tracking()?.payment?.expiresAt;
    if (!expires) return null;
    const seconds = Math.max(0, Math.floor((Date.parse(expires) - this.now()) / 1000));
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  });
  protected readonly expireAt = computed(() => {
    const expires = this.tracking()?.payment?.expiresAt;
    return expires
      ? new Intl.DateTimeFormat('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'Asia/Ho_Chi_Minh',
        }).format(new Date(expires))
      : null;
  });
  protected readonly step = computed(() => {
    const status = this.tracking()?.order.status;
    return status ? STEPS.indexOf(status) : -1;
  });
  protected readonly steps = STEPS;

  constructor() {
    inject(PageMeta).set({
      title: 'Đơn hàng của bạn',
      description: 'Thanh toán và theo dõi đơn hàng.',
      path: '/don',
      robots: 'noindex',
    });
  }

  ngOnInit(): void {
    if (!this.browser) return;
    const timer = setInterval(() => {
      this.now.set(Date.now());
    }, 1000);
    this.destroyRef.onDestroy(() => {
      clearInterval(timer);
    });
    const remembered = this.cart.phoneFor(this.code().toUpperCase());
    if (remembered) this.load(remembered);
    else this.state.set('ask-phone');
  }

  protected submitPhone(): void {
    const phone = this.phoneForm.getRawValue().phone.replace(/[\s.-]/g, '');
    if (phone) this.load(phone);
  }

  private load(phone: string): void {
    this.phone = phone;
    this.state.set('loading');
    this.api.track(this.code(), phone).subscribe({
      next: (tracking) => {
        this.tracking.set(tracking);
        this.state.set('ready');
        this.cart.rememberOrder(tracking.order.code, phone);
      },
      error: (error: unknown) => {
        this.state.set(toApiError(error).status === 404 ? 'not-found' : 'error');
      },
    });
  }

  protected async copy(label: string, value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      this.copied.set(label);
      setTimeout(() => {
        this.copied.set(null);
      }, 2000);
    } catch {
      this.copied.set(null);
    }
  }

  protected cancel(): void {
    const code = this.tracking()?.order.code;
    if (!code) return;
    this.api.cancel(code, this.phone).subscribe({
      next: () => {
        this.confirmCancel.set(false);
        this.load(this.phone);
      },
      error: (error: unknown) => {
        this.cancelError.set(
          toApiError(error).status === 409
            ? 'Đơn này đã được thanh toán nên không hủy được. Liên hệ cơ sở nếu cần đổi.'
            : 'Không hủy được đơn. Thử lại sau ít phút.',
        );
      },
    });
  }
}
