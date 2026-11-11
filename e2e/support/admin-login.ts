import { expect, Page } from '@playwright/test';

export async function loginAdmin(
  page: Page,
  identifier = process.env['E2E_ADMIN_USER'] ?? 'owner',
): Promise<void> {
  await page.goto('login');
  await page.getByLabel('Tên đăng nhập', { exact: true }).fill(identifier);
  await page
    .getByLabel('Mật khẩu', { exact: true })
    .fill(process.env['E2E_ADMIN_PASSWORD'] ?? 'mock-password-only');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
}
