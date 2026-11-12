import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { AccessTokenStore, provideCore } from '@bepthaymao/core';
import { AuthSessionService } from './features/auth/data-access/auth-session.service';
import { of } from 'rxjs';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideCore(), provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('renders the routing outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });
  it.each(['Owner', 'BranchManager'] as const)(
    'shows %s identity navigation and signs out',
    async (role) => {
      TestBed.inject(AccessTokenStore).set({
        identifier: 'staff',
        role,
        accessToken: 'test-token',
      });
      const logout = vi
        .spyOn(TestBed.inject(AuthSessionService), 'logout')
        .mockReturnValue(of(undefined));
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      const html = fixture.nativeElement as HTMLElement;
      expect(html.textContent).toContain(role === 'Owner' ? 'Chủ sở hữu' : 'Quản lý cơ sở');
      html.querySelector<HTMLButtonElement>('button')?.click();
      expect(logout).toHaveBeenCalledOnce();
      expect(navigate).toHaveBeenCalledWith('/login');
    },
  );
});
