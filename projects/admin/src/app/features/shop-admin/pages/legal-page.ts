import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { OwnerLegalDto, PolicyDto, PolicyKind } from '@bepthaymao/api-client';
import { toApiError } from '@bepthaymao/core';
import { HlmButton } from '@bepthaymao/ui';
import { ShopAdminService } from '../data-access/shop-admin.service';

const FIELDS = [
  'businessName',
  'registrationNumber',
  'registrationIssuedOn',
  'registrationIssuedBy',
  'address',
  'phone',
  'email',
  'moitNoticeUrl',
] as const;

function firstError(error: unknown, fallback: string): string {
  const errors = toApiError(error).errors ?? {};
  return Object.values(errors).at(0)?.at(0) ?? fallback;
}

/** Chân trang theo quy định thương mại điện tử: chủ quán nhập thông tin người bán và sáu chính sách. */
@Component({
  selector: 'adm-legal-page',
  imports: [ReactiveFormsModule, HlmButton],
  templateUrl: './legal-page.html',
  styleUrl: './shop-admin.css',
})
export class LegalPage {
  private readonly service = inject(ShopAdminService);
  private readonly destroy = inject(DestroyRef);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly state = signal<'loading' | 'loaded' | 'error'>('loading');
  protected readonly message = signal('');
  protected readonly policies = signal<readonly PolicyDto[]>([]);
  protected readonly selected = signal<PolicyKind>('Terms');
  protected readonly current = computed(
    () => this.policies().find((policy) => policy.kind === this.selected()) ?? null,
  );
  protected readonly legalForm = this.fb.group({
    businessName: [''],
    registrationNumber: [''],
    registrationIssuedOn: [''],
    registrationIssuedBy: [''],
    address: [''],
    phone: [''],
    email: [''],
    moitNoticeUrl: [''],
  });
  protected readonly policyForm = this.fb.group({ body: [''] });

  constructor() {
    this.load();
  }

  protected load(): void {
    this.state.set('loading');
    this.service
      .legal()
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (legal) => {
          this.fill(legal);
          this.state.set('loaded');
        },
        error: () => {
          this.state.set('error');
        },
      });
  }

  private fill(legal: OwnerLegalDto): void {
    this.legalForm.reset(Object.fromEntries(FIELDS.map((field) => [field, legal[field] ?? ''])));
    this.policies.set(legal.policies);
    this.pick(this.selected());
  }

  protected pick(kind: PolicyKind): void {
    this.selected.set(kind);
    this.policyForm.reset({ body: this.current()?.body ?? '' });
  }

  protected saveLegal(): void {
    const value = this.legalForm.getRawValue();
    const input = Object.fromEntries(
      FIELDS.map((field) => [field, value[field].trim() || null]),
    ) as Record<(typeof FIELDS)[number], string | null>;
    this.service
      .saveLegal(input)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (legal) => {
          this.fill(legal);
          this.message.set('Đã lưu thông tin người bán. Chân trang của khách đã cập nhật.');
        },
        error: (error: unknown) => {
          this.message.set(firstError(error, 'Không lưu được thông tin người bán.'));
        },
      });
  }

  protected savePolicy(): void {
    const kind = this.selected();
    this.service
      .savePolicy(kind, this.policyForm.getRawValue().body)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (saved) => {
          this.policies.update((list) =>
            list.map((policy) => (policy.kind === kind ? saved : policy)),
          );
          this.message.set(
            saved.body
              ? `Đã lưu "${saved.title}". Chính sách đang hiện ở chân trang.`
              : `Đã ẩn "${saved.title}" khỏi chân trang.`,
          );
        },
        error: (error: unknown) => {
          this.message.set(firstError(error, 'Không lưu được chính sách.'));
        },
      });
  }
}
