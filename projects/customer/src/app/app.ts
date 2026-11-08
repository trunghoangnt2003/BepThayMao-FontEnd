import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'cus-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: { '[attr.lang]': 'pageLanguage' },
})
export class App {
  protected readonly pageLanguage = 'vi';
}
