import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SiteFooter } from './features/legal/ui/site-footer';
import { CartStore } from './features/shop/data-access/shop-data';
import { RouteLoader } from './shared/loader/route-loader';
@Component({
  selector: 'cus-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SiteFooter, RouteLoader],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly lang = 'vi';
  protected readonly cart = inject(CartStore);
}
