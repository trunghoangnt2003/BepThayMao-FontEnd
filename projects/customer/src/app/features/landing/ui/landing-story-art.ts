import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Hình thúng xôi xéo (SVG) với năm lớp; màu qua token --story-*, hiệu ứng lớp rơi do CSS lo. */
@Component({
  selector: 'cus-landing-story-art',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing-story-art.html',
  styleUrl: './landing-story-art.css',
})
export class LandingStoryArt {
  readonly label = input('Thúng xôi xéo với nếp, đậu xanh, hành phi, chả lụa và trứng kho');
}
