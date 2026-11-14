import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MenuDishDto } from '@bepthaymao/api-client';
import { CartStore } from '../data-access/shop-data';
import { CartBar, DishRow, DishThumb, QtyStepper } from './shop-ui';
import { StepProgress } from './step-progress';

const dish: MenuDishDto = {
  id: 'd1',
  name: 'Xôi gà xé',
  description: 'Gà luộc xé',
  price: 40000,
  imageUrl: null,
  category: 'XoiMan',
  isFeatured: true,
  unavailableBranchIds: [],
  orderCount: 0,
};

@Component({
  imports: [DishRow, CartBar, DishThumb, StepProgress],
  template: `
    <cus-dish-row [dish]="dish()" [branchCount]="branches()" />
    <cus-dish-thumb name="Ảnh thật" category="Chay" imageUrl="/anh.jpg" />
    <cus-cart-bar />
    <cus-step-progress
      [labels]="['A', 'B', 'C', 'D']"
      [current]="1"
      [reached]="1"
      (pick)="picked.set($event)"
    />
  `,
})
class Host {
  readonly dish = signal(dish);
  readonly branches = signal(0);
  readonly picked = signal(-1);
}

describe('shop UI', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('adds and removes a dish with the stepper and shows the cart bar', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const html = fixture.nativeElement as HTMLElement;
    const cart = TestBed.inject(CartStore);
    expect(html.querySelector('cus-cart-bar .bar')).toBeNull();
    html.querySelector<HTMLButtonElement>('[aria-label="Thêm Xôi gà xé"]')?.click();
    html.querySelector<HTMLButtonElement>('[aria-label="Thêm Xôi gà xé"]')?.click();
    await fixture.whenStable();
    expect(cart.quantityOf('d1')).toBe(2);
    expect(html.querySelector('cus-cart-bar')?.textContent).toContain('2 món');
    expect(html.querySelector('cus-cart-bar')?.textContent).toContain('80.000');
    html.querySelector<HTMLButtonElement>('[aria-label="Bớt Xôi gà xé"]')?.click();
    await fixture.whenStable();
    expect(cart.quantityOf('d1')).toBe(1);
  });

  it('marks a dish sold out everywhere and hides its add button', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.dish.set({ ...dish, unavailableBranchIds: ['b1', 'b2'] });
    fixture.componentInstance.branches.set(2);
    await fixture.whenStable();
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('cus-dish-row')?.textContent).toContain('Hết ở mọi cơ sở');
    expect(html.querySelector('cus-dish-row [aria-label="Thêm Xôi gà xé"]')).toBeNull();
  });

  it('shows an uploaded photo and lets customers go back only to reached steps', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('img')?.getAttribute('alt')).toBe('Ảnh món Ảnh thật');
    const steps = html.querySelectorAll<HTMLButtonElement>('cus-step-progress button');
    expect(steps[1].getAttribute('aria-current')).toBe('step');
    expect(steps[2].disabled).toBe(true);
    steps[0].click();
    expect(fixture.componentInstance.picked()).toBe(0);
  });
});

describe('click spark', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('draws a spark on add unless reduced motion is requested', async () => {
    const motion = { matches: false };
    vi.stubGlobal('matchMedia', () => motion);
    const fixture = TestBed.createComponent(QtyStepper);
    fixture.componentRef.setInput('dish', dish);
    await fixture.whenStable();
    vi.useFakeTimers();
    const html = fixture.nativeElement as HTMLElement;
    const add = html.querySelector<HTMLButtonElement>('[aria-label="Thêm Xôi gà xé"]');
    add?.click();
    expect(html.querySelectorAll('.fx-spark i').length).toBe(8);
    vi.advanceTimersByTime(500);
    expect(html.querySelector('.fx-spark')).toBeNull();
    motion.matches = true;
    add?.click();
    expect(html.querySelector('.fx-spark')).toBeNull();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
});
