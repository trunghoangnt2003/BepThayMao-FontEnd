import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './support/a11y';

test('admin has route title and accessible navigation @a11y', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('khong-co');
  await expect(page).toHaveTitle('Không tìm thấy trang | Quản trị Bếp Thầy Mão');
  await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toBeVisible();
  await expectNoA11yViolations(page);
  expect(errors).toEqual([]);
});

test('admin raw HTML explains the JavaScript requirement', async ({ request }) => {
  const response = await request.get('khong-co');
  const html = await response.text();
  expect(html).toContain('Trang quản trị cần bật JavaScript để hoạt động.');
  expect(html).toContain('noindex,nofollow');
});

test('admin focuses the main heading after navigation', async ({ page }) => {
  await page.goto('khong-co');
  await page.getByRole('link', { name: 'Cơ sở', exact: true }).click();
  await expect(page.locator('main#main h1')).toBeFocused();
});

for (const width of [320, 768, 1440]) {
  test(`admin shell fits viewport ${width.toString()}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('khong-co');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`admin-${width.toString()}.png`),
      fullPage: true,
    });
  });
}
