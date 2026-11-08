import { DOCUMENT } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from '../../app';
import { NotFoundPage } from '../../pages/not-found/not-found-page';
import { provideRouteFocus } from './route-focus';

let fixture: ComponentFixture<App>;

beforeEach(async () => {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([
        { path: 'one', component: NotFoundPage },
        { path: 'two', component: NotFoundPage },
      ]),
      provideRouteFocus(),
    ],
  });
  fixture = TestBed.createComponent(App);
  await TestBed.inject(Router).navigateByUrl('/one');
  await fixture.whenStable();
});

it('does not steal focus during the initial navigation', () => {
  const document = TestBed.inject(DOCUMENT);
  expect(document.activeElement).not.toBe(document.querySelector('main#main h1'));
});

it('focuses the main heading after a later route navigation', async () => {
  await TestBed.inject(Router).navigateByUrl('/two');
  await fixture.whenStable();
  const document = TestBed.inject(DOCUMENT);
  const heading = document.querySelector('main#main h1');
  expect(heading).not.toBeNull();
  expect(document.activeElement).toBe(heading);
});
