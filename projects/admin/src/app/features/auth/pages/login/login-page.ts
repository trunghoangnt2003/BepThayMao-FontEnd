import { Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toApiError } from '@bepthaymao/core';
import { finalize } from 'rxjs';
import { safeReturnUrl } from '../../../../shared/auth/safe-return-url';
import { IconComponent } from '../../../../shared/icon/icon';
import { LineIconComponent } from '../../../../shared/icon/line-icon';
import { HlmButton, HlmInput, HlmLabel } from '@bepthaymao/ui';
import { AuthSessionService } from '../../data-access/auth-session.service';
import { roleHome } from '../../data-access/role-home';

@Component({
  selector: 'adm-login-page',
  imports: [ReactiveFormsModule, HlmButton, HlmInput, HlmLabel, IconComponent, LineIconComponent],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  private readonly auth = inject(AuthSessionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly identifierInput = viewChild<ElementRef<HTMLInputElement>>('identifierInput');
  private readonly passwordInput = viewChild<ElementRef<HTMLInputElement>>('passwordInput');
  protected readonly heroWords = ['Cả', 'bếp', 'trong', 'một', 'màn', 'hình'];
  readonly submitting = signal(false);
  readonly showProgress = signal(false);
  readonly visiblePassword = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly customerDenied = signal(this.auth.store.session()?.role === 'Customer');
  readonly expired = signal(this.route.snapshot.queryParamMap.get('reason') === 'expired');
  readonly form = new FormGroup({
    identifier: new FormControl('', {
      nonNullable: true,
      validators: [(control) => Validators.required(control)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [(control) => Validators.required(control)],
    }),
  });

  submit(): void {
    if (this.submitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      (this.form.controls.identifier.invalid
        ? this.identifierInput()
        : this.passwordInput()
      )?.nativeElement.focus();
      return;
    }
    this.errorMessage.set(null);
    this.expired.set(false);
    this.submitting.set(true);
    const timer = setTimeout(() => {
      this.showProgress.set(true);
    }, 300);
    const { identifier, password } = this.form.getRawValue();
    this.auth
      .login(identifier, password)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          clearTimeout(timer);
          this.submitting.set(false);
          this.showProgress.set(false);
        }),
      )
      .subscribe({
        next: (pair) => {
          if (pair.role === 'Customer') {
            this.customerDenied.set(true);
            return;
          }
          const destination = safeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl'));
          void this.router.navigateByUrl(destination ?? roleHome(pair.role));
        },
        error: (error: unknown) => {
          this.handleError(error);
        },
      });
  }

  fieldInvalid(field: 'identifier' | 'password'): boolean {
    const control = this.form.controls[field];
    return control.invalid && control.touched;
  }

  logout(): void {
    this.auth.logout().subscribe(() => {
      this.customerDenied.set(false);
    });
  }

  private handleError(error: unknown): void {
    const status = toApiError(error).status;
    this.errorMessage.set(
      status === 429
        ? 'Bạn đã thử đăng nhập quá nhiều lần. Hãy thử lại sau ít phút.'
        : status === 401
          ? 'Tên đăng nhập hoặc mật khẩu không đúng. Kiểm tra lại rồi thử lần nữa.'
          : 'Không thể đăng nhập lúc này. Hãy thử lại.',
    );
    if (status === 401) {
      this.form.controls.password.reset();
      this.passwordInput()?.nativeElement.focus();
    }
  }
}
