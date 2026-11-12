import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  OnDestroy,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiError, toApiError } from '@bepthaymao/core';
import { HlmButton, HlmInput, HlmLabel } from '@bepthaymao/ui';
import { finalize } from 'rxjs';
import { generatePassword } from '../../../../shared/auth/random-password';
import { IconComponent } from '../../../../shared/icon/icon';
import { OwnerBranchesService } from '../../data-access/owner-branches.service';
import { BranchForm } from '../../ui/branch-form/branch-form';
import { createBranchFields, toBranchSettings } from '../../ui/branch-form/branch-form.model';

export interface CreatedBranch {
  readonly id: string;
  readonly name: string;
  readonly identifier: string;
  readonly password: string;
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
  ],
  templateUrl: './branch-create-page.html',
  styleUrl: './branch-create-page.css',
})
export class BranchCreatePage implements OnDestroy {
  private readonly service = inject(OwnerBranchesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly form = new FormGroup({
    branch: createBranchFields(),
    manager: new FormGroup({
      identifier: new FormControl('', {
        nonNullable: true,
        validators: [(control) => Validators.required(control)],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [(control) => Validators.required(control)],
      }),
    }),
  });
  readonly submitting = signal(false);
  readonly failure = signal<ApiError | null>(null);
  readonly created = signal<CreatedBranch | null>(null);
  readonly visiblePassword = signal(false);
  readonly copied = signal(false);

  submit(): void {
    if (this.submitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.failure.set(null);
    this.submitting.set(true);
    const { branch, manager } = this.form.getRawValue();
    this.service
      .create({ branch: toBranchSettings(branch), manager })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.submitting.set(false);
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
          this.focusHeading();
        },
        error: (error: unknown) => {
          this.failure.set(toApiError(error));
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
    this.form.reset();
    this.focusHeading();
  }

  ngOnDestroy(): void {
    this.created.set(null);
  }

  private focusHeading(): void {
    afterNextRender(
      () => {
        this.host.nativeElement.querySelector('h1')?.focus();
      },
      { injector: this.injector },
    );
  }
}
