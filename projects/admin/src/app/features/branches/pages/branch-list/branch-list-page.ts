import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BranchResponse } from '@bepthaymao/api-client';
import { toApiError } from '@bepthaymao/core';
import { formatOpeningHours, HlmButton } from '@bepthaymao/ui';
import { finalize, Subscription, timer } from 'rxjs';
import { OwnerBranchesService } from '../../data-access/owner-branches.service';

@Component({
  selector: 'adm-branch-list-page',
  imports: [HlmButton],
  templateUrl: './branch-list-page.html',
  styleUrl: './branch-list-page.css',
})
export class BranchListPage {
  private readonly service = inject(OwnerBranchesService);
  private readonly destroy = inject(DestroyRef);
  private request?: Subscription;
  readonly state = signal<'loading' | 'loaded' | 'error'>('loading');
  readonly branches = signal<readonly BranchResponse[]>([]);
  readonly showSkeleton = signal(false);
  readonly correlationId = signal<string | undefined>(undefined);
  readonly formatOpeningHours = formatOpeningHours;
  constructor() {
    this.load();
  }
  load(): void {
    this.request?.unsubscribe();
    this.state.set('loading');
    this.showSkeleton.set(false);
    const delay = timer(200)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe(() => {
        this.showSkeleton.set(true);
      });
    this.request = this.service
      .list()
      .pipe(
        takeUntilDestroyed(this.destroy),
        finalize(() => {
          delay.unsubscribe();
          this.showSkeleton.set(false);
        }),
      )
      .subscribe({
        next: (branches) => {
          this.branches.set(branches);
          this.state.set('loaded');
        },
        error: (error: unknown) => {
          this.correlationId.set(toApiError(error).correlationId);
          this.state.set('error');
        },
      });
  }
}
