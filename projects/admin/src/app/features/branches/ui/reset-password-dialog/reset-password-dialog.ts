import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  OnDestroy,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ApiError, toApiError } from '@bepthaymao/core';
import {
  HlmButton,
  HlmDialog,
  HlmDialogDescription,
  HlmDialogTitle,
  HlmInput,
  HlmLabel,
} from '@bepthaymao/ui';
import { BrnDialogContext, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { finalize } from 'rxjs';
import { generatePassword } from '../../../../shared/auth/random-password';
import { failureText } from '../../../../shared/forms/api-failure';
import { Banner } from '../../../../shared/forms/banner';
import { FieldNote } from '../../../../shared/forms/field-note';
import { trackForm } from '../../../../shared/forms/track-form';
import { IconComponent } from '../../../../shared/icon/icon';
import { OwnerBranchesService } from '../../data-access/owner-branches.service';
import { firstMessage } from '../branch-form/branch-form.model';
import { managerPasswordValidator, requiredField } from '../branch-form/branch-form.validators';

export interface ResetPasswordContext {
  readonly branchId: string;
  readonly branchName: string;
}

function firstServerMessage(error: ApiError): string | undefined {
  const entries = Object.entries(error.errors ?? {});
  const match = entries.find(([key]) => key.toLowerCase().endsWith('newpassword'));
  return match?.[1].at(0);
}

/**
 * Two phases: choose a new manager password, then show it once. The password lives only in the
 * `issued` signal and the form control; both are emptied on close, cancel and destroy.
 */
@Component({
  selector: 'adm-reset-password-dialog',
  imports: [
    ReactiveFormsModule,
    HlmButton,
    HlmDialog,
    HlmDialogTitle,
    HlmDialogDescription,
    HlmInput,
    HlmLabel,
    Banner,
    FieldNote,
    IconComponent,
  ],
  templateUrl: './reset-password-dialog.html',
  styleUrl: './reset-password-dialog.css',
})
export class ResetPasswordDialog implements OnDestroy {
  protected readonly context = injectBrnDialogContext<BrnDialogContext<ResetPasswordContext>>();
  private readonly service = inject(OwnerBranchesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly password = new FormControl('', {
    nonNullable: true,
    validators: [requiredField('mật khẩu mới'), managerPasswordValidator],
  });
  private readonly version = trackForm(() => this.password);
  readonly issued = signal<string | null>(null);
  readonly visible = signal(false);
  readonly submitting = signal(false);
  readonly showProgress = signal(false);
  readonly failure = signal<ApiError | null>(null);
  readonly copied = signal(false);
  readonly message = computed(() => {
    this.version();
    return this.password.touched ? firstMessage(this.password.errors) : undefined;
  });
  readonly failureMessage = computed(() => {
    const error = this.failure();
    return error === null
      ? ''
      : failureText(error, 'Không thể đặt lại mật khẩu lúc này. Hãy thử lại.');
  });

  generate(): void {
    this.password.setValue(generatePassword());
    this.visible.set(true);
  }

  submit(): void {
    if (this.submitting()) return;
    this.failure.set(null);
    if (this.password.invalid) {
      this.password.markAsTouched();
      return;
    }
    const value = this.password.value;
    this.submitting.set(true);
    const timer = setTimeout(() => {
      this.showProgress.set(true);
    }, 300);
    this.service
      .resetPassword(this.context.branchId, value)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          clearTimeout(timer);
          this.submitting.set(false);
          this.showProgress.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.issued.set(value);
          this.password.reset();
          this.visible.set(false);
          afterNextRender(
            () => {
              this.host.nativeElement.querySelector<HTMLElement>('h2')?.focus();
            },
            { injector: this.injector },
          );
        },
        error: (error: unknown) => {
          this.handleFailure(toApiError(error));
        },
      });
  }

  copy(): void {
    const value = this.issued();
    if (value === null) return;
    navigator.clipboard.writeText(value).then(
      () => {
        this.copied.set(true);
      },
      () => {
        this.copied.set(false);
      },
    );
  }

  /** Cancel and "Đóng" both end here, so the password never outlives the dialog. */
  dismiss(): void {
    this.forget();
    this.context.close();
  }

  ngOnDestroy(): void {
    this.forget();
  }

  private forget(): void {
    this.issued.set(null);
    this.password.reset();
    this.copied.set(false);
  }

  private handleFailure(error: ApiError): void {
    const message = error.status === 400 ? firstServerMessage(error) : undefined;
    if (message !== undefined) {
      this.password.setErrors({ server: message });
      this.password.markAsTouched();
    } else this.failure.set(error);
  }
}
