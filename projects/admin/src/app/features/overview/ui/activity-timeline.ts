import { Component, input } from '@angular/core';
import { OverviewActivityDto } from '@bepthaymao/api-client';
import { LineIconComponent } from '../../../shared/icon/line-icon';
import { ACTIVITY_TONE, formatClock } from '../data-access/overview-model';

/** Dòng hoạt động hôm nay, dựng từ đơn và tình trạng món. */
@Component({
  selector: 'adm-activity-timeline',
  imports: [LineIconComponent],
  template: `
    @if (items().length === 0) {
      <p class="empty">Chưa có hoạt động nào hôm nay.</p>
    } @else {
      <ol>
        @for (item of items(); track $index) {
          <li>
            <span [class]="'ic ' + tones[item.kind].tone"
              ><adm-line-icon [name]="tones[item.kind].icon"
            /></span>
            <div>
              <b>{{ item.title }}</b>
              <p>{{ item.detail }}</p>
            </div>
            <time class="num" [attr.datetime]="item.at">{{ formatClock(item.at) }}</time>
          </li>
        }
      </ol>
    }
  `,
  styleUrl: './activity-timeline.css',
})
export class ActivityTimelineComponent {
  readonly items = input.required<readonly OverviewActivityDto[]>();
  protected readonly tones = ACTIVITY_TONE;
  protected readonly formatClock = formatClock;
}
