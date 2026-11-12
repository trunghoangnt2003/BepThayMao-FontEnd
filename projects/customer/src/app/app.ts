import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CartStore } from './features/shop/data-access/shop-data';
@Component({
  selector: 'cus-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly lang = 'vi';
  protected readonly cart = inject(CartStore);
}
