import { test, expect } from '@playwright/test';
test('admin focus and title follow subsequent navigation', async ({ page }) => {
  await page.goto('khong-co');
  await page.getByRole('link', { name: 'Về trang của tôi' }).click();
  await expect(page).toHaveTitle('Danh sách cơ sở | Quản trị Bếp Thầy Mão');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
});
