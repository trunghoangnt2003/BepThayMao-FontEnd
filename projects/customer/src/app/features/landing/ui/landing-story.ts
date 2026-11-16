import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuDishDto } from '@bepthaymao/api-client';
import { formatVnd } from '../../shop/data-access/shop-data';
import { LandingStoryArt } from './landing-story-art';

/** Năm lớp của một phần xôi xéo, theo thứ tự xếp từ dưới lên. */
export const STORY_STEPS = [
  { num: '01', name: 'Nếp dẻo', text: 'Lớp nền nóng hổi, đặt trên lá chuối.' },
  { num: '02', name: 'Đậu xanh', text: 'Đánh nhuyễn, phủ một lớp dày.' },
  { num: '03', name: 'Hành phi', text: 'Rắc đều cho giòn và thơm.' },
  { num: '04', name: 'Chả lụa', text: 'Thái lát, xếp chồng lên trên.' },
  { num: '05', name: 'Trứng kho', text: 'Đậm vị, bổ đôi.' },
] as const;

/**
 * Xôi xéo lắp từng lớp khi cuộn. Trình duyệt hỗ trợ animation-timeline thì CSS tự chạy;
 * không hỗ trợ thì IntersectionObserver kích hoạt một lần; reduced-motion hoặc tắt JS thì tĩnh.
 */
@Component({
  selector: 'cus-landing-story',
  imports: [RouterLink, LandingStoryArt],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing-story.html',
  styleUrl: './landing-story.css',
  host: { '[class.story--io]': 'io()', '[class.is-in]': 'assembled()' },
})
export class LandingStory {
  readonly dish = input<MenuDishDto | null>(null);
  protected readonly steps = STORY_STEPS;
  protected readonly formatVnd = formatVnd;
  protected readonly io = signal(false);
  protected readonly assembled = signal(false);
  private readonly stage = viewChild<ElementRef<HTMLElement>>('stage');

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (
        typeof matchMedia === 'function' &&
        matchMedia('(prefers-reduced-motion: reduce)').matches
      )
        return;
      if (
        typeof CSS !== 'undefined' &&
        typeof CSS.supports === 'function' &&
        CSS.supports('animation-timeline: view()')
      )
        return;
      const stage = this.stage()?.nativeElement;
      if (!stage || typeof IntersectionObserver === 'undefined') return;
      this.io.set(true);
      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          this.assembled.set(true);
          observer.unobserve(stage);
        },
        { threshold: 0.35 },
      );
      observer.observe(stage);
      destroyRef.onDestroy(() => {
        observer.disconnect();
      });
    });
  }
}
