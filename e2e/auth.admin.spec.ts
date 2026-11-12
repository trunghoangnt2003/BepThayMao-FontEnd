import { test, expect } from '@playwright/test';
import { loginAdmin } from './support/admin-login';
import { expectNoA11yViolations } from './support/a11y';

test('owner signs in with memory-only credentials and signs out', async ({ page }) => {
  await page.goto('login');
  await page.getByLabel('Tên đăng nhập', { exact: true }).fill('owner');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('mock-password-only');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/owner\/branches$/);
  await expect(page.getByText('Chủ sở hữu', { exact: true })).toBeVisible();
  expect(
    await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length })),
  ).toEqual({ local: 0, session: 0 });
  await page.getByRole('button', { name: /Đăng xuất/ }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test('restores on reload and forbids Manager on Owner routes @a11y', async ({ page }) => {
  await loginAdmin(page, 'quanly1');
  await page.goto('owner/branches');
  await expect(page).toHaveURL(/\/admin\/forbidden$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Bạn không có quyền vào trang này',
  );
  await expectNoA11yViolations(page);
});

test('login is accessible by keyboard and at six widths @a11y', async ({ page }) => {
  await page.goto('login?reason=expired');
  await expect(page.getByRole('status')).toContainText('Phiên đăng nhập đã hết hạn.');
  await expectNoA11yViolations(page);
  for (const width of [320, 375, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 800 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  const identifier = page.getByLabel('Tên đăng nhập', { exact: true });
  await identifier.fill('owner');
  await identifier.focus();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Mật khẩu', { exact: true })).toBeFocused();
  await page.keyboard.type('mock-password-only');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Hiện mật khẩu', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Đăng nhập', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/admin\/owner\/branches$/);
  await page.reload();
  await expect(page.getByText('Chủ sở hữu', { exact: true })).toBeVisible();
});

test('reports 401 and 429 without lockout language and rejects Customer', async ({ page }) => {
  await page.goto('login');
  await page.getByLabel('Tên đăng nhập', { exact: true }).fill('owner');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('incorrect-password');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Tên đăng nhập hoặc mật khẩu không đúng.');
  await expect(page.getByLabel('Mật khẩu', { exact: true })).toBeEmpty();
  await expect(page.getByLabel('Mật khẩu', { exact: true })).toBeFocused();
  await page.getByLabel('Tên đăng nhập', { exact: true }).fill('rate-limited');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('mock-password-only');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Hãy thử lại sau ít phút.');
  await page.getByLabel('Tên đăng nhập', { exact: true }).fill('khach1');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText(
    'Tài khoản này không có quyền vào trang quản trị.',
  );
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
});
