import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { TokenPair } from '@bepthaymao/api-client';
import { AccessTokenStore } from '@bepthaymao/core';
import { Observable, of, Subject, throwError } from 'rxjs';
import { AuthSessionService } from '../../data-access/auth-session.service';
import { LoginPage } from './login-page';

function setup(response: Observable<TokenPair>, reason?: string) {
  const auth = {
    login: vi.fn(() => response),
    logout: vi.fn(() => of(undefined)),
    store: new AccessTokenStore(),
  };
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: AuthSessionService, useValue: auth },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { queryParamMap: convertToParamMap(reason ? { reason } : {}) } },
      },
    ],
  });
  vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  const fixture = TestBed.createComponent(LoginPage);
  fixture.detectChanges();
  return { fixture, auth, html: fixture.nativeElement as HTMLElement };
}
const pair: TokenPair = { accessToken: 'test', identifier: 'owner', role: 'Owner', expiresIn: 900 };
describe('login validation and feedback', () => {
  it('marks empty fields and focuses the first error', () => {
    const { fixture, html, auth } = setup(of(pair));
    fixture.componentInstance.form.markAllAsTouched();
    fixture.componentInstance.submit();
    fixture.detectChanges();
    expect(html.textContent).toContain('Nhập tên đăng nhập.');
    expect(html.textContent).toContain('Nhập mật khẩu.');
    expect(html.querySelector('#identifier')?.getAttribute('aria-invalid')).toBe('true');
    expect(html.querySelector('#identifier')?.getAttribute('aria-describedby')).toBe(
      'identifier-error',
    );
    expect(document.activeElement).toBe(html.querySelector('#identifier'));
    expect(auth.login).not.toHaveBeenCalled();
  });
  it.each([
    [401, 'Tên đăng nhập hoặc mật khẩu không đúng. Kiểm tra lại rồi thử lần nữa.'],
    [429, 'Bạn đã thử đăng nhập quá nhiều lần. Hãy thử lại sau ít phút.'],
  ])('shows safe %s feedback', (status, message) => {
    const { fixture, html } = setup(
      throwError(() => new HttpErrorResponse({ status, error: { detail: 'private stack' } })),
    );
    fixture.componentInstance.form.setValue({ identifier: 'owner', password: 'bad-password' });
    fixture.componentInstance.submit();
    fixture.detectChanges();
    expect(html.querySelector('[role="alert"]')?.textContent).toContain(message);
    expect(html.textContent).not.toContain('private stack');
    if (status === 401) {
      expect(fixture.componentInstance.form.controls.password.value).toBe('');
      expect(document.activeElement).toBe(html.querySelector('#password'));
    }
  });
});
describe('login session and password controls', () => {
  it('announces expired session and lets a Customer sign out', () => {
    const { fixture, html, auth } = setup(of({ ...pair, role: 'Customer' }), 'expired');
    expect(html.querySelector('[role="status"]')?.textContent).toContain(
      'Phiên đăng nhập đã hết hạn. Đăng nhập lại để tiếp tục.',
    );
    fixture.componentInstance.form.setValue({ identifier: 'customer', password: 'password-only' });
    fixture.componentInstance.submit();
    fixture.detectChanges();
    expect(html.textContent).toContain('Tài khoản này không có quyền vào trang quản trị.');
    const logout = Array.from(html.querySelectorAll('button')).find((button) =>
      button.textContent.includes('Đăng xuất'),
    );
    logout?.click();
    expect(auth.logout).toHaveBeenCalledOnce();
  });
  it('toggles password visibility with accessible state', () => {
    const { fixture, html } = setup(of(pair));
    const toggle = html.querySelector<HTMLButtonElement>('[aria-label="Hiện mật khẩu"]');
    expect(toggle).not.toBeNull();
    toggle?.click();
    fixture.detectChanges();
    expect(html.querySelector('#password')?.getAttribute('type')).toBe('text');
    expect(toggle?.getAttribute('aria-pressed')).toBe('true');
    expect(toggle?.getAttribute('aria-label')).toBe('Ẩn mật khẩu');
  });
  it('disables only while submitting and delays the progress label', () => {
    vi.useFakeTimers();
    try {
      const response = new Subject<TokenPair>();
      const { fixture, html } = setup(response);
      fixture.componentInstance.form.setValue({ identifier: 'owner', password: 'password-only' });
      fixture.componentInstance.submit();
      fixture.detectChanges();
      expect(html.querySelector<HTMLButtonElement>('[type="submit"]')?.disabled).toBe(true);
      expect(html.textContent).not.toContain('Đang đăng nhập…');
      vi.advanceTimersByTime(301);
      fixture.detectChanges();
      expect(html.textContent).toContain('Đang đăng nhập…');
      response.next(pair);
      response.complete();
      fixture.detectChanges();
      expect(html.querySelector<HTMLButtonElement>('[type="submit"]')?.disabled).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});
