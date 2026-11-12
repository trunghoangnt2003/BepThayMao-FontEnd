import { test, expect } from '@playwright/test';
import { expectNoA11yViolations } from './support/a11y';

test('404 shell and keyboard access @a11y', async ({ page }, info) => {
  const response = await page.goto(info.project.name === 'customer' ? '/khong-co' : 'khong-co');
  if (info.project.name === 'customer') expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Không tìm thấy trang');
  await page.keyboard.press('Tab');
  await expect(page.getByText('Bỏ qua tới nội dung chính')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main#main')).toBeFocused();
  await expectNoA11yViolations(page);
});
