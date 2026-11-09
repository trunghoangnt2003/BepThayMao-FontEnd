import { test, expect } from '@playwright/test';
test.use({ javaScriptEnabled: false });
test('directory contains real HTML without JavaScript', async ({ page }) => {
  await page.goto('/co-so');
  await expect(page.locator('article')).toHaveCount(2);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/co-so$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Các cơ sở của Bếp Thầy Mão');
  await expect(page.locator('a[href="tel:+842800000001"]')).toBeVisible();
});
test('404 and skip link work without JavaScript', async ({ page }) => {
  const response = await page.goto('/khong-co');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Không tìm thấy trang');
  await page.keyboard.press('Tab');
  await expect(page.getByText('Bỏ qua tới nội dung chính')).toBeFocused();
});
