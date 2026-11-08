import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SkipLink } from '@bepthaymao/ui';

@Component({
  selector: 'adm-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, SkipLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: { '[attr.lang]': 'pageLanguage' },
})
export class App {
  protected readonly pageLanguage = 'vi';
}
