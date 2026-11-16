import { NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Hero trang giới thiệu: ảnh món, chữ viết tay, thẻ kem chứa H1 và nút Đặt món ngay. */
@Component({
  selector: 'cus-landing-hero',
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './landing-hero.html',
  styleUrl: './landing-hero.css',
})
export class LandingHero {
  readonly image = input.required<string>();
}
