import { expect, Page, test } from '@playwright/test';
import { expectNoA11yViolations } from './support/a11y';

const viewports = [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 412, height: 892 },
  { width: 1280, height: 800 },
] as const;

async function expectInFirstScreen(page: Page, selector: string): Promise<void> {
  const box = await page.locator(selector).first().boundingBox();
  const height = page.viewportSize()?.height ?? 0;
  expect(box).not.toBeNull();
  expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(height);
}

for (const viewport of viewports) {
  test.describe(`landing ${String(viewport.width)}x${String(viewport.height)}`, () => {
    test.use({ viewport });

    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('h1')).toHaveText('Xôi nóng phố cũ, giao tận nơi');
    });

    test('does not scroll sideways', async ({ page }) => {
      const widths = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        inner: window.innerWidth,
      }));
      expect(widths.scroll).toBeLessThanOrEqual(widths.inner);
    });

    test('keeps the headline and order button in the first screen', async ({ page }, info) => {
      if (viewport.width >= 375) {
        await expectInFirstScreen(page, 'h1');
        await expectInFirstScreen(page, '.hero a.btn--red');
      }
      await page.screenshot({
        path: info.outputPath(`landing-${String(viewport.width)}x${String(viewport.height)}.png`),
      });
    });
  });
}

test.describe('landing hero promises', () => {
  test('hide the promise strip on a short phone and show it on a taller one', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('.hero__feat')).toBeHidden();
    await page.setViewportSize({ width: 412, height: 892 });
    await expect(page.locator('.hero__feat')).toBeVisible();
  });
});

test('landing has no accessibility violations on a phone @a11y', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await expectNoA11yViolations(page);
});

test.describe('landing without JavaScript', () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 375, height: 667 } });

  test('still shows the headline and every story layer caption', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('Nếp dẻo')).toBeAttached();
    await expect(page.getByText('Trứng kho')).toBeAttached();
  });
});
