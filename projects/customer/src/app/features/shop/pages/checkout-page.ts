import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BranchOptionDto } from '@bepthaymao/api-client';
import { toApiError } from '@bepthaymao/core';
import { PageMeta } from '../../../shared/seo/page-meta';
import {
  checkoutProblems,
  CheckoutProblem,
  CheckoutStep,
  problemsForStep,
  stepOf,
} from '../data-access/checkout-rules';
import { OrderApi, unavailableDishIds } from '../data-access/order-api';
import { CartStore, formatVnd } from '../data-access/shop-data';
import { DishThumb, QtyStepper } from '../ui/shop-ui';
import { StepProgress } from '../ui/step-progress';
import { KitchenLoader } from '../../../shared/loader/kitchen-loader';

const STEPS: readonly { title: string; hint: string; label: string }[] = [
  { title: 'Giỏ hàng', hint: 'Xem lại món và số lượng.', label: 'Giỏ hàng' },
  { title: 'Người nhận', hint: 'Quán giao tới ai, ở đâu?', label: 'Người nhận' },
  { title: 'Chọn cơ sở', hint: 'Cơ sở gần bạn được gợi ý trước.', label: 'Cơ sở' },
  { title: 'Xem lại và thanh toán', hint: 'Kiểm tra lần cuối rồi lấy mã QR.', label: 'Thanh toán' },
];

function serverMessage(error: unknown): string {
  const apiError = toApiError(error);
  if (apiError.status === 429) return 'Bạn thử quá nhiều lần. Đợi vài phút rồi thử lại.';
  const first = Object.values(apiError.errors ?? {})
    .at(0)
    ?.at(0);
  if (first) return first;
  const reference = apiError.correlationId ? ` Mã lỗi: ${apiError.correlationId}` : '';
  return `Không gửi được đơn. Thử lại sau ít phút.${reference}`;
}

@Component({
  selector: 'cus-checkout-page',
  imports: [ReactiveFormsModule, RouterLink, DishThumb, QtyStepper, StepProgress, KitchenLoader],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.css',
})
export class CheckoutPage {
  protected readonly cart = inject(CartStore);
  private readonly api = inject(OrderApi);
  private readonly router = inject(Router);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  protected readonly formatVnd = formatVnd;
  protected readonly options = signal<readonly BranchOptionDto[] | null>(null);
  protected readonly optionsError = signal(false);
  protected readonly location = signal<{ lat: number; lng: number } | null>(null);
  protected readonly locating = signal<'idle' | 'busy' | 'denied' | 'done'>('idle');
  protected readonly submitting = signal(false);
  protected readonly serverError = signal<string | null>(null);
  protected readonly unavailable = signal<readonly string[]>([]);
  protected readonly errors = signal<readonly CheckoutProblem[]>([]);
  private readonly summary = viewChild<ElementRef<HTMLElement>>('summary');
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  protected readonly steps = STEPS;
  protected readonly stepLabels = STEPS.map((item) => item.label);
  protected readonly step = signal<CheckoutStep>(0);
  protected readonly reached = signal<CheckoutStep>(0);

  protected readonly form = inject(NonNullableFormBuilder).group({
    address: [''],
    branchId: [''],
    acknowledged: [false],
    name: [''],
    phone: [''],
    note: [''],
  });
  private readonly branchId = signal('');

  protected readonly selected = computed(
    () => this.options()?.find((option) => option.branchId === this.branchId()) ?? null,
  );
  private readonly missingIds = computed(
    () => new Set([...(this.selected()?.unavailableDishIds ?? []), ...this.unavailable()]),
  );
  protected readonly missingNames = computed(() =>
    this.cart
      .lines()
      .filter((line) => this.missingIds().has(line.dishId))
      .map((line) => line.name),
  );

  constructor() {
    inject(PageMeta).set({
      title: 'Đặt hàng',
      description: 'Xác nhận món, chọn cơ sở và nhập thông tin nhận hàng.',
      path: '/dat-hang',
      robots: 'noindex',
    });
    this.form.controls.branchId.valueChanges.subscribe((value) => {
      this.branchId.set(value);
      this.unavailable.set([]);
    });
    effect(() => {
      const dishIds = this.cart.lines().map((line) => line.dishId);
      const location = this.location();
      if (this.browser && dishIds.length > 0) this.loadOptions(dishIds, location);
    });
  }

  private loadOptions(dishIds: string[], location: { lat: number; lng: number } | null): void {
    this.api.branchOptions(dishIds, location).subscribe({
      next: (options) => {
        this.options.set(options);
        this.optionsError.set(false);
        const suggested = options.find((option) => option.isSuggested);
        if (suggested && (!this.form.controls.branchId.value || location))
          this.form.controls.branchId.setValue(suggested.branchId);
      },
      error: () => {
        this.optionsError.set(true);
      },
    });
  }

  protected locate(): void {
    if (!this.browser || !('geolocation' in navigator)) {
      this.locating.set('denied');
      return;
    }
    this.locating.set('busy');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.location.set({ lat: position.coords.latitude, lng: position.coords.longitude });
        this.locating.set('done');
      },
      () => {
        this.locating.set('denied');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  protected dropMissing(): void {
    this.cart.remove([...this.missingIds()]);
    this.unavailable.set([]);
  }

  private allProblems(): CheckoutProblem[] {
    const value = this.form.getRawValue();
    const phone = value.phone.replace(/[\s.-]/g, '');
    return checkoutProblems({ ...value, phone }, this.selected(), this.missingNames());
  }

  /** Nút Tiếp tục (và Enter): kiểm bước hiện tại; bước cuối thì gửi đơn. */
  protected submit(): void {
    this.serverError.set(null);
    const step = this.step();
    if (step < 3) {
      const problems = problemsForStep(this.allProblems(), step);
      this.errors.set(problems);
      if (problems.length > 0) {
        this.focusSummary();
        return;
      }
      this.goTo((step + 1) as CheckoutStep, true);
      return;
    }
    const problems = this.allProblems();
    const option = this.selected();
    if (problems.length > 0 || !option) {
      const first = problems.at(0);
      if (first) this.goTo(stepOf(first), true);
      this.errors.set(problemsForStep(problems, this.step()));
      this.focusSummary();
      return;
    }
    this.send(option.branchId, this.form.getRawValue().phone.replace(/[\s.-]/g, ''));
  }

  protected back(): void {
    const step = this.step();
    if (step === 0) {
      void this.router.navigate(['/thuc-don']);
      return;
    }
    this.goTo((step - 1) as CheckoutStep);
  }

  /** Chỉ quay lại bước đã tới; force dùng khi máy chủ hoặc kiểm cuối báo lỗi ở bước trước. */
  protected goTo(step: CheckoutStep, force = false): void {
    if (!force && step > this.reached()) return;
    this.errors.set([]);
    this.step.set(step);
    if (step > this.reached()) this.reached.set(step);
    queueMicrotask(() => {
      this.heading()?.nativeElement.focus();
    });
  }

  private send(branchId: string, phone: string): void {
    const value = this.form.getRawValue();
    this.submitting.set(true);
    this.api
      .create({
        customerName: value.name.trim(),
        customerPhone: phone,
        deliveryAddress: value.address.trim(),
        branchId,
        deliveryLat: this.location()?.lat ?? null,
        deliveryLng: this.location()?.lng ?? null,
        note: value.note.trim() || null,
        nextDayAcknowledged: value.acknowledged,
        items: this.cart.lines().map((line) => ({ dishId: line.dishId, quantity: line.quantity })),
      })
      .subscribe({
        next: (created) => {
          this.cart.rememberOrder(created.order.code, phone);
          this.cart.clear();
          void this.router.navigate(['/don', created.order.code]);
        },
        error: (error: unknown) => {
          this.submitting.set(false);
          this.unavailable.set(unavailableDishIds(error));
          this.serverError.set(serverMessage(error));
          if (this.unavailable().length > 0) this.goTo(2, true);
          this.focusSummary();
        },
      });
  }

  private focusSummary(): void {
    queueMicrotask(() => {
      this.summary()?.nativeElement.focus();
    });
  }

  protected focusField(id: string, event: Event): void {
    event.preventDefault();
    document.getElementById(id)?.focus();
  }
}
