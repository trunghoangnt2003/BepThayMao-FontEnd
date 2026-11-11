import { test, expect } from '@playwright/test';

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
