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
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiError, toApiError } from '@bepthaymao/core';
import { HlmButton, HlmInput, HlmLabel } from '@bepthaymao/ui';
import { finalize } from 'rxjs';
import { generatePassword } from '../../../../shared/auth/random-password';
import { Banner } from '../../../../shared/forms/banner';
import { ErrorSummary } from '../../../../shared/forms/error-summary';
import { FieldNote } from '../../../../shared/forms/field-note';
import { trackForm } from '../../../../shared/forms/track-form';
import { IconComponent } from '../../../../shared/icon/icon';
import { OwnerBranchesService } from '../../data-access/owner-branches.service';
import { BranchForm } from '../../ui/branch-form/branch-form';
import {
  applyBranchServerErrors,
  applyManagerServerErrors,
  branchFieldErrors,
  createBranchFields,
  createManagerFields,
  FieldError,
  firstMessage,
  managerFieldErrors,
  toBranchSettings,
} from '../../ui/branch-form/branch-form.model';

export interface CreatedBranch {
  readonly id: string;
  readonly name: string;
  readonly identifier: string;
  readonly password: string;
}

const DUPLICATE_IDENTIFIER = 'Tên đăng nhập này đã có người dùng. Chọn tên khác.';
const IDENTIFIER_HINT = 'Từ 3 đến 64 ký tự: chữ không dấu, số và . _ - @ +, không khoảng trắng.';

function failureText(error: ApiError): string {
  const code = error.correlationId
    ? ` Nếu vẫn lỗi, gửi mã ${error.correlationId} cho đội phát triển.`
    : '';
  if (error.kind === 'network') return 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
  if (error.status === 429) return 'Bạn thao tác quá nhanh. Đợi một chút rồi thử lại.';
  if (error.status >= 500) return `Máy chủ gặp lỗi. Hãy thử lại sau ít phút.${code}`;
  return `Không thể tạo cơ sở lúc này. Hãy thử lại.${code}`;
}

@Component({
  selector: 'adm-branch-create-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    HlmButton,
    HlmInput,
    HlmLabel,
    BranchForm,
    IconComponent,
    ErrorSummary,
    Banner,
    FieldNote,
  ],
  templateUrl: './branch-create-page.html',
  styleUrl: './branch-create-page.css',
})
export class BranchCreatePage implements OnDestroy {
  private readonly service = inject(OwnerBranchesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly form = new FormGroup({ branch: createBranchFields(), manager: createManagerFields() });
  private readonly version = trackForm(() => this.form.controls.manager);
  readonly submitting = signal(false);
  readonly showProgress = signal(false);
  readonly failure = signal<ApiError | null>(null);
  readonly summary = signal<readonly FieldError[]>([]);
  readonly created = signal<CreatedBranch | null>(null);
  readonly visiblePassword = signal(false);
  readonly copied = signal(false);
  readonly identifierHint = IDENTIFIER_HINT;
  readonly failureMessage = computed(() => {
    const error = this.failure();
    return error === null ? '' : failureText(error);
  });
  readonly managerMessages = computed(() => {
    this.version();
    const { identifier, password } = this.form.controls.manager.controls;
    return {
      identifier: identifier.touched ? firstMessage(identifier.errors) : undefined,
      password: password.touched ? firstMessage(password.errors) : undefined,
    };
  });

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
    const { branch, manager } = this.form.getRawValue();
    this.service
      .create({ branch: toBranchSettings(branch), manager })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          clearTimeout(timer);
          this.submitting.set(false);
          this.showProgress.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.created.set({
            id: response.id,
            name: response.name,
            identifier: manager.identifier,
            password: manager.password,
          });
          this.form.controls.manager.controls.password.reset();
          this.focusAfterRender(() => this.host.nativeElement.querySelector('h1'));
        },
        error: (error: unknown) => {
          this.handleFailure(toApiError(error));
        },
      });
  }

  generatePassword(): void {
    this.form.controls.manager.controls.password.setValue(generatePassword());
    this.visiblePassword.set(true);
  }

  copyPassword(): void {
    const password = this.created()?.password;
    if (password === undefined) return;
    navigator.clipboard.writeText(password).then(
      () => {
        this.copied.set(true);
      },
      () => {
        this.copied.set(false);
      },
    );
  }

  another(): void {
    this.created.set(null);
    this.copied.set(false);
    this.visiblePassword.set(false);
    this.summary.set([]);
    this.form.reset();
    this.focusAfterRender(() => this.host.nativeElement.querySelector('h1'));
  }

  ngOnDestroy(): void {
    this.created.set(null);
  }

  private handleFailure(error: ApiError): void {
    const { branch, manager } = this.form.controls;
    if (error.status === 409) {
      manager.controls.identifier.setErrors({ server: DUPLICATE_IDENTIFIER });
      manager.controls.identifier.markAsTouched();
      this.showProblems();
      return;
    }
    const applied =
      error.status === 400 && error.errors
        ? applyBranchServerErrors(branch, error.errors) +
          applyManagerServerErrors(manager, error.errors)
        : 0;
    if (applied > 0) this.showProblems();
    else this.failure.set(error);
  }

  private showProblems(): void {
    const { branch, manager } = this.form.controls;
    const problems = [...branchFieldErrors(branch), ...managerFieldErrors(manager)];
    this.summary.set(problems);
    if (problems.length > 0) {
      this.focusAfterRender(() => this.host.nativeElement.querySelector('#error-summary-title'));
    }
  }

  private focusAfterRender(target: () => HTMLElement | null): void {
    afterNextRender(
      () => {
        target()?.focus();
      },
      { injector: this.injector },
    );
  }
}
