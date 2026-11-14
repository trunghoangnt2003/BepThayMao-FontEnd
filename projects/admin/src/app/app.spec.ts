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
      html.querySelector<HTMLButtonElement>('button[aria-label^="Đăng xuất"]')?.click();
      expect(logout).toHaveBeenCalledOnce();
      expect(navigate).toHaveBeenCalledWith('/login');
    },
  );

  it('collapses the sidebar on desktop and remembers it', async () => {
    TestBed.inject(AccessTokenStore).set({ identifier: 'chu', role: 'Owner', accessToken: 't' });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const html = fixture.nativeElement as HTMLElement;
    const toggle = html.querySelector<HTMLButtonElement>('button[aria-controls="side"]');
    expect(toggle?.getAttribute('aria-label')).toBe('Thu gọn thanh điều hướng');
    toggle?.click();
    await fixture.whenStable();
    expect(html.querySelector('.app')?.getAttribute('data-collapsed')).toBe('true');
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    expect(localStorage.getItem('btm.side')).toBe('collapsed');
    expect(html.querySelector('.nav__label')?.textContent).toContain('Tổng quan');
    localStorage.removeItem('btm.side');
  });
});

function el(root: HTMLElement, selector: string): HTMLElement {
  const element = root.querySelector<HTMLElement>(selector);
  if (!element) throw new Error(`Không thấy ${selector}`);
  return element;
}

describe('App on phones', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideCore(), provideRouter([])],
    }).compileComponents();
  });

  it('opens a drawer, locks the page behind it and closes on Escape or the scrim', async () => {
    const media: { listener: ((event: { matches: boolean }) => void) | null } = { listener: null };
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: (_: string, handler: (event: { matches: boolean }) => void) => {
        media.listener = handler;
      },
      removeEventListener: () => undefined,
    }));
    TestBed.inject(AccessTokenStore).set({
      identifier: 'ql',
      role: 'BranchManager',
      accessToken: 't',
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const html = fixture.nativeElement as HTMLElement;
    const toggle = el(html, 'button[aria-controls="side"]');
    const drawer = () => el(html, '.app').getAttribute('data-drawer');
    expect(toggle.getAttribute('aria-label')).toBe('Mở menu');
    expect(el(html, '#side').hasAttribute('inert')).toBe(true);
    toggle.click();
    await fixture.whenStable();
    expect(drawer()).toBe('open');
    expect(el(html, '.column').hasAttribute('inert')).toBe(true);
    expect(html.textContent).toContain('Thông số cơ sở');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(drawer()).toBe('closed');
    toggle.click();
    await fixture.whenStable();
    el(html, '.adm-scrim').click();
    await fixture.whenStable();
    expect(html.querySelector('.adm-scrim')).toBeNull();
    media.listener?.({ matches: false });
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-label')).toBe('Thu gọn thanh điều hướng');
    fixture.destroy();
    vi.unstubAllGlobals();
  });

  it('moves focus to the main content from the skip link', async () => {
    TestBed.inject(AccessTokenStore).set({ identifier: 'chu', role: 'Owner', accessToken: 't' });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const html = fixture.nativeElement as HTMLElement;
    document.body.appendChild(html);
    el(html, '.skip-link').click();
    expect(document.activeElement?.id).toBe('main');
    html.remove();
  });
});
