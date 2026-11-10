import { Component, DestroyRef, inject, signal } from '@angular/core';
import type { PublicBranch } from '@bepthaymao/api-client';
import { type ApiError, toApiError } from '@bepthaymao/core';
import { formatOpeningHours, HlmButton } from '@bepthaymao/ui';
import { type Subscription, timer } from 'rxjs';
import { AdminBranchesService } from '../../data-access/admin-branches.service';

type ListState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'loaded'; readonly branches: readonly PublicBranch[] }
  | { readonly kind: 'error'; readonly error: ApiError };

const SKELETON_DELAY_MS = 200;

@Component({
  selector: 'adm-branch-list-page',
  imports: [HlmButton],
  templateUrl: './branch-list-page.html',
  styleUrl: './branch-list-page.css',
})
export class BranchListPage {
  private readonly service = inject(AdminBranchesService);
  private subscriptions: Subscription[] = [];

  protected readonly state = signal<ListState>({ kind: 'loading' });
  protected readonly showSkeleton = signal(false);
  protected readonly skeletonRows = [1, 2, 3];
  protected readonly formatOpeningHours = formatOpeningHours;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.cancel();
    });
    this.load();
  }

  protected load(): void {
    this.cancel();
    this.state.set({ kind: 'loading' });
    this.showSkeleton.set(false);
    // Fast responses never flash a skeleton (UI-SPEC A2).
    const skeleton = timer(SKELETON_DELAY_MS).subscribe(() => {
      this.showSkeleton.set(true);
    });
    const request = this.service.list().subscribe({
      next: (branches) => {
        this.state.set({ kind: 'loaded', branches });
      },
      error: (error: unknown) => {
        skeleton.unsubscribe();
        this.state.set({ kind: 'error', error: toApiError(error) });
      },
      complete: () => {
        skeleton.unsubscribe();
      },
    });
    this.subscriptions = [skeleton, request];
  }

  private cancel(): void {
    for (const subscription of this.subscriptions) subscription.unsubscribe();
    this.subscriptions = [];
  }
}
