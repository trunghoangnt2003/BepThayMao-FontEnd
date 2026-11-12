import { test, expect } from '@playwright/test';
import { expectNoA11yViolations } from './support/a11y';
import { loginAdmin } from './support/admin-login';

test.beforeEach(async ({ page }, info) => {
  if (info.project.name === 'admin') await loginAdmin(page);
});

test('branch data and accessibility @a11y', async ({ page }, info) => {
  if (info.project.name === 'customer') {
    const browserRequests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/api/v1/branches')) browserRequests.push(request.url());
    });
    await page.goto('/co-so');
    await expect(page.locator('article')).toHaveCount(2);
    await expect(page).toHaveTitle('Các cơ sở | Bếp Thầy Mão');
    await expect(page.locator('a[href="tel:+842800000001"]')).toBeVisible();
    expect(browserRequests).toEqual([]);
  } else {
    await page.goto('branches');
    await expect(page.locator('tbody tr')).toHaveCount(2);
    await expect(page).toHaveTitle('Danh sách cơ sở | Quản trị Bếp Thầy Mão');
  }
  await expectNoA11yViolations(page);
});

test('mobile first layouts and reduced motion', async ({ page }, info) => {
  for (const width of [320, 375, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 800 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(info.project.name === 'customer' ? '/co-so' : 'branches');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({
      path: test.info().outputPath(`${info.project.name}-${width.toString()}.png`),
      fullPage: true,
    });
  }
});
