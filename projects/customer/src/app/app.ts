import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SkipLink } from '@bepthaymao/ui';

@Component({
  selector: 'cus-root',
  imports: [RouterOutlet, SkipLink],
  templateUrl: './app.html',
  host: { '[attr.lang]': 'pageLanguage' },
})
export class App {
  protected readonly pageLanguage = 'vi';
}
