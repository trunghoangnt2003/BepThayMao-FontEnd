import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './support/a11y';

test('customer 404 has accessible content @a11y', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const response = await page.goto('/khong-co');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Không tìm thấy trang');
  await expectNoA11yViolations(page);
  expect(errors).toEqual([]);
});

test.describe('customer without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('renders the heading and skip link in server HTML', async ({ page }) => {
    await page.goto('/khong-co');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Không tìm thấy trang');
    await expect(page.getByRole('link', { name: 'Bỏ qua tới nội dung chính' })).toBeAttached();
  });
});

test('customer skip link focuses main without changing the route', async ({ page }) => {
  await page.goto('/khong-co');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Bỏ qua tới nội dung chính' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main#main')).toBeFocused();
  await expect(page).toHaveURL(/\/khong-co#main$/);
});

for (const width of [320, 768, 1440]) {
  test(`customer shell fits viewport ${width.toString()}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/khong-co');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`customer-${width.toString()}.png`),
      fullPage: true,
    });
  });
}
