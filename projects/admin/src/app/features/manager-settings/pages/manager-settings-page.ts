import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ManagerBranchView } from '@bepthaymao/api-client';
import { ApiError, toApiError } from '@bepthaymao/core';
import { HlmButton, HlmInput, HlmLabel } from '@bepthaymao/ui';
import { finalize } from 'rxjs';
import { Banner } from '../../../shared/forms/banner';
import { ErrorSummary } from '../../../shared/forms/error-summary';
import { FieldNote } from '../../../shared/forms/field-note';
import { savedTime } from '../../../shared/forms/saved-time';
import { failureText } from '../../../shared/forms/api-failure';
import { trackForm } from '../../../shared/forms/track-form';
import { IconComponent } from '../../../shared/icon/icon';
import { FieldError } from '../../branches/ui/branch-form/branch-form.model';
import { ManagerSettingsService } from '../data-access/manager-settings.service';
import {
  applySettingsServerErrors,
  createSettingsFields,
  settingsFieldErrors,
  settingsMessages,
  settingsToFormValue,
  toSettingsRequest,
} from './manager-settings-form';

const NONE = 'Chưa có';

@Component({
  selector: 'adm-manager-settings-page',
  imports: [
    ReactiveFormsModule,
    HlmButton,
    HlmInput,
    HlmLabel,
    Banner,
    ErrorSummary,
    FieldNote,
    IconComponent,
  ],
  templateUrl: './manager-settings-page.html',
  styleUrl: './manager-settings-page.css',
})
export class ManagerSettingsPage {
  private readonly service = inject(ManagerSettingsService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly form = createSettingsFields();
  private readonly version = trackForm(() => this.form);
  readonly view = signal<ManagerBranchView | null>(null);
  readonly loading = signal(true);
  readonly showSkeleton = signal(false);
  readonly loadFailure = signal<ApiError | null>(null);
  readonly submitting = signal(false);
  readonly showProgress = signal(false);
  readonly failure = signal<ApiError | null>(null);
  readonly summary = signal<readonly FieldError[]>([]);
  readonly savedAt = signal<string | null>(null);
  readonly savedText = computed(() => {
    const at = this.savedAt();
    return at === null ? '' : `Đã lưu lúc ${at}.`;
  });
  readonly loadMessage = computed(() => {
    const error = this.loadFailure();
    return error === null ? '' : failureText(error, 'Không tải được thông số cơ sở. Hãy thử lại.');
  });
  readonly failureMessage = computed(() => {
    const error = this.failure();
    return error === null ? '' : failureText(error, 'Không thể lưu thông số lúc này. Hãy thử lại.');
  });
  readonly messages = computed(() => {
    this.version();
    return settingsMessages(this.form);
  });
  readonly owned = computed(() => {
    const view = this.view();
    if (view === null) return [];
    const text = (value: string | null): string =>
      value !== null && value.trim() !== '' ? value : NONE;
    return [
      { label: 'Tên cơ sở', value: text(view.name) },
      { label: 'Địa chỉ', value: text(view.address) },
      { label: 'Trạng thái nhận đơn', value: view.isActive ? 'Đang nhận đơn' : 'Đã tắt' },
      { label: 'Mã ngân hàng', value: text(view.bankCode) },
      { label: 'Số tài khoản', value: text(view.bankAccountNo) },
      { label: 'Mã tham chiếu SePay', value: text(view.sepayAccountRef) },
    ];
  });

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.savedAt.set(null);
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadFailure.set(null);
    const skeletonTimer = setTimeout(() => {
      this.showSkeleton.set(true);
    }, 200);
    this.service
      .get()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          clearTimeout(skeletonTimer);
          this.loading.set(false);
          this.showSkeleton.set(false);
        }),
      )
      .subscribe({
        next: (view) => {
          this.view.set(view);
          this.form.reset(settingsToFormValue(view));
        },
        error: (error: unknown) => {
          const problem = toApiError(error);
          if (problem.status === 403) void this.router.navigateByUrl('/forbidden');
          else this.loadFailure.set(problem);
        },
      });
  }

  submit(): void {
    if (this.submitting()) return;
    this.failure.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showProblems();
      return;
    }
    this.summary.set([]);
    this.submitting.set(true);
    const timer = setTimeout(() => {
      this.showProgress.set(true);
    }, 300);
    this.service
      .update(toSettingsRequest(this.form))
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          clearTimeout(timer);
          this.submitting.set(false);
          this.showProgress.set(false);
        }),
      )
      .subscribe({
        next: (view) => {
          this.view.set(view);
          this.form.reset(settingsToFormValue(view));
          this.savedAt.set(savedTime());
        },
        error: (error: unknown) => {
          this.handleFailure(toApiError(error));
        },
      });
  }

  private handleFailure(error: ApiError): void {
    if (error.status === 403) {
      void this.router.navigateByUrl('/forbidden');
      return;
    }
    const applied =
      error.status === 400 && error.errors ? applySettingsServerErrors(this.form, error.errors) : 0;
    if (applied > 0) this.showProblems();
    else this.failure.set(error);
  }

  private showProblems(): void {
    const problems = settingsFieldErrors(this.form);
    this.summary.set(problems);
    if (problems.length > 0) {
      afterNextRender(
        () => {
          this.host.nativeElement.querySelector<HTMLElement>('#error-summary-title')?.focus();
        },
        { injector: this.injector },
      );
    }
  }
}
