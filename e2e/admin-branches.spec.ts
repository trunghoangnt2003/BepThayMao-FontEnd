import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './support/a11y';

test('admin branch list shows a table with a route title @a11y', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('branches');
  await expect(page).toHaveTitle('Danh sách cơ sở | Quản trị Bếp Thầy Mão');
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('rowheader')).toHaveCount(2);
  await expect(page.getByRole('columnheader')).toHaveText(['Cơ sở', 'Giờ nhận đơn']);
  await expectNoA11yViolations(page);
  expect(errors).toEqual([]);
});

test('admin root redirects to branches', async ({ page }) => {
  await page.goto('./');
  await expect(page).toHaveURL(/\/admin\/branches$/);
});

test('admin table reflows at 320px without horizontal scroll', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('branches');
  await expect(page.getByRole('rowheader')).toHaveCount(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: testInfo.outputPath('admin-branches-320.png'), fullPage: true });
});
