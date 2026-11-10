import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './support/a11y';

test('public branches render from SSR without refetching after hydration (P31)', async ({
  page,
}) => {
  const apiCalls: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/api/v1/branches') apiCalls.push(request.url());
  });
  await page.goto('/co-so');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Các cơ sở của Bếp Thầy Mão');
  await expect(page.locator('article')).toHaveCount(2);
  await expect(page.locator('article').first().getByRole('link')).toHaveAttribute(
    'href',
    /^tel:\+84\d+$/,
  );
  expect(apiCalls).toEqual([]);
});

test('public branches have no accessibility violations @a11y', async ({ page }) => {
  await page.goto('/co-so');
  await expectNoA11yViolations(page);
});

test('root redirects to the branch list', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/co-so$/);
});

test.describe('public branches without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('server HTML has content, tel links and metadata', async ({ page }) => {
    await page.goto('/co-so');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Các cơ sở của Bếp Thầy Mão');
    await expect(page.locator('article')).toHaveCount(2);
    await expect(page.locator('a[href^="tel:+84"]')).toHaveCount(2);
    await expect(page).toHaveTitle('Các cơ sở | Bếp Thầy Mão');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/co-so$/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      'Các cơ sở | Bếp Thầy Mão',
    );
  });
});

test('same-origin API through the gateway @gateway', async ({ request }) => {
  const response = await request.get('/api/v1/branches');
  expect(response.status()).toBe(200);
  const body: unknown = await response.json();
  expect(Array.isArray(body) && body.length === 2).toBe(true);
});

for (const width of [320, 375, 1440]) {
  test(`public branches fit viewport ${width.toString()}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/co-so');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`co-so-${width.toString()}.png`),
      fullPage: true,
    });
  });
}
