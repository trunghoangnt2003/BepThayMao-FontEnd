import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButton } from '@bepthaymao/ui';

@Component({
  selector: 'adm-not-found-page',
  imports: [RouterLink, HlmButton],
  templateUrl: './not-found-page.html',
  styleUrl: './not-found-page.css',
})
export class NotFoundPage {
  protected readonly title = 'Không tìm thấy trang';
}
