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
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BranchResponse } from '@bepthaymao/api-client';
import { ApiError, toApiError } from '@bepthaymao/core';
import { HlmButton } from '@bepthaymao/ui';
import { catchError, EMPTY, finalize, firstValueFrom, Observable, switchMap, tap } from 'rxjs';
import { ConfirmDialog } from '../../../../shared/dialog/confirm-dialog';
import { failureText } from '../../../../shared/forms/api-failure';
import { Banner } from '../../../../shared/forms/banner';
import { ErrorSummary } from '../../../../shared/forms/error-summary';
import { savedTime } from '../../../../shared/forms/saved-time';
import { adminTitle } from '../../../../shared/title/admin-title-strategy';
import { OwnerBranchesService } from '../../data-access/owner-branches.service';
import { BranchForm } from '../../ui/branch-form/branch-form';
import {
  applyFlatBranchServerErrors,
  branchFieldErrors,
  branchToFormValue,
  BranchFieldsValue,
  createBranchFields,
  FieldError,
  toBranchSettings,
  toOwnerSettings,
} from '../../ui/branch-form/branch-form.model';
import { HasUnsavedChanges } from './unsaved-changes.guard';

type LoadState = 'loading' | 'ready' | 'notFound' | 'failed';

function sameValue(a: BranchFieldsValue, b: BranchFieldsValue): boolean {
  return (Object.keys(a) as (keyof BranchFieldsValue)[]).every((key) => a[key] === b[key]);
}

@Component({
  selector: 'adm-branch-edit-page',
  imports: [ReactiveFormsModule, RouterLink, HlmButton, BranchForm, Banner, ErrorSummary],
  templateUrl: './branch-edit-page.html',
  styleUrl: './branch-edit-page.css',
})
export class BranchEditPage implements HasUnsavedChanges {
  private readonly service = inject(OwnerBranchesService);
  private readonly confirmDialog = inject(ConfirmDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly form = createBranchFields();
  private id = '';
  /** The branch exactly as last saved on the server; on/off sends this, never the form. */
  readonly branch = signal<BranchResponse | null>(null);
  private savedValue: BranchFieldsValue | null = null;
  readonly state = signal<LoadState>('loading');
  readonly showSkeleton = signal(false);
  readonly loadFailure = signal<ApiError | null>(null);
  readonly submitting = signal(false);
  readonly showProgress = signal(false);
  readonly toggling = signal(false);
  readonly failure = signal<ApiError | null>(null);
  readonly summary = signal<readonly FieldError[]>([]);
  readonly savedAt = signal<string | null>(null);
  readonly heading = computed(() => {
    switch (this.state()) {
      case 'notFound':
        return 'Không tìm thấy cơ sở này';
      case 'failed':
        return 'Không tải được cơ sở';
      case 'loading':
        return 'Đang tải cơ sở…';
      case 'ready':
        return this.branch()?.name ?? '';
    }
  });
  readonly savedText = computed(() => {
    const at = this.savedAt();
    return at === null ? '' : `Đã lưu lúc ${at}.`;
  });
  readonly loadMessage = computed(() => {
    const error = this.loadFailure();
    return error === null ? '' : failureText(error, 'Không tải được cơ sở. Hãy thử lại.');
  });
  readonly failureMessage = computed(() => {
    const error = this.failure();
    return error === null ? '' : failureText(error, 'Không thể lưu lúc này. Hãy thử lại.');
  });

  constructor() {
    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((params) => {
          this.id = params.get('id') ?? '';
          return this.fetch();
        }),
      )
      .subscribe();
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.savedAt.set(null);
    });
  }

  hasUnsavedChanges(): boolean {
    return this.savedValue !== null && !sameValue(this.form.getRawValue(), this.savedValue);
  }

  retry(): void {
    this.fetch().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  submit(): void {
    const current = this.branch();
    if (this.submitting() || current === null) return;
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
    const body = { ...toBranchSettings(this.form.getRawValue()), isActive: current.isActive };
    this.service
      .update(this.id, body)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          clearTimeout(timer);
          this.submitting.set(false);
          this.showProgress.set(false);
        }),
      )
      .subscribe({
        next: (saved) => {
          this.accept(saved);
          this.form.reset(branchToFormValue(saved));
          this.savedAt.set(savedTime());
        },
        error: (error: unknown) => {
          this.handleSaveFailure(toApiError(error));
        },
      });
  }

  /** Off asks first; on runs at once. Either way only the last saved values plus `isActive` are sent. */
  async toggleActive(): Promise<void> {
    const current = this.branch();
    if (current === null || this.toggling()) return;
    const next = !current.isActive;
    if (!next) {
      const confirmed = await this.confirmDialog.confirm({
        title: `Tắt nhận đơn cơ sở ${current.name}?`,
        body: 'Cơ sở sẽ không được gán đơn mới cho tới khi bạn bật lại.',
        confirmLabel: 'Tắt nhận đơn',
        cancelLabel: 'Giữ nguyên',
        danger: true,
      });
      if (!confirmed) return;
    }
    this.failure.set(null);
    this.toggling.set(true);
    try {
      this.accept(
        await firstValueFrom(this.service.update(this.id, toOwnerSettings(current, next))),
      );
    } catch (error) {
      this.handleSaveFailure(toApiError(error));
    } finally {
      this.toggling.set(false);
    }
  }

  private fetch(): Observable<unknown> {
    this.state.set('loading');
    this.loadFailure.set(null);
    const timer = setTimeout(() => {
      this.showSkeleton.set(true);
    }, 200);
    return this.service.get(this.id).pipe(
      tap((branch) => {
        this.onLoaded(branch);
      }),
      catchError((error: unknown) => {
        this.onLoadFailed(toApiError(error));
        return EMPTY;
      }),
      finalize(() => {
        clearTimeout(timer);
        this.showSkeleton.set(false);
      }),
    );
  }

  private onLoaded(branch: BranchResponse): void {
    this.accept(branch);
    this.form.reset(branchToFormValue(branch));
    this.state.set('ready');
    this.title.setTitle(adminTitle(branch.name));
  }

  private onLoadFailed(error: ApiError): void {
    if (error.status === 404) this.state.set('notFound');
    else if (error.status === 403) void this.router.navigateByUrl('/forbidden');
    else {
      this.loadFailure.set(error);
      this.state.set('failed');
    }
  }

  private accept(saved: BranchResponse): void {
    this.branch.set(saved);
    this.savedValue = branchToFormValue(saved);
  }

  private handleSaveFailure(error: ApiError): void {
    if (error.status === 403) {
      void this.router.navigateByUrl('/forbidden');
      return;
    }
    const applied =
      error.status === 400 && error.errors
        ? applyFlatBranchServerErrors(this.form, error.errors)
        : 0;
    if (applied > 0) this.showProblems();
    else this.failure.set(error);
  }

  private showProblems(): void {
    const problems = branchFieldErrors(this.form);
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
