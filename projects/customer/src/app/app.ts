import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SiteFooter } from './features/legal/ui/site-footer';
import { CartStore } from './features/shop/data-access/shop-data';
import { RouteLoader } from './shared/loader/route-loader';

@Component({
  selector: 'cus-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgOptimizedImage, SiteFooter, RouteLoader],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly lang = 'vi';
  protected readonly cart = inject(CartStore);
  protected readonly links = [
    { path: '/', label: 'Giới thiệu' },
    { path: '/dat-mon', label: 'Đặt món' },
    { path: '/co-so', label: 'Cơ sở' },
    { path: '/tra-don', label: 'Tra đơn' },
  ] as const;
  protected readonly quick = [
    {
      path: '/',
      label: 'Trang chủ',
      icon: ['M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'],
    },
    { path: '/dat-mon', label: 'Đặt món', icon: ['M4 6h16M4 12h16M4 18h10'] },
    { path: '/dat-hang', label: 'Giỏ hàng', icon: ['M5 8h14l-1 12H6z', 'M9 8a3 3 0 0 1 6 0'] },
    {
      path: '/tra-don',
      label: 'Đơn hàng',
      icon: ['M6 3h12v18l-3-2-3 2-3-2-3 2z', 'M9 8h6M9 12h6'],
    },
  ] as const;
}
