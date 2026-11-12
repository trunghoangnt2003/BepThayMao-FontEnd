import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './support/a11y';
import { loginAdmin } from './support/admin-login';

const WIDTHS = [320, 375, 768, 1024, 1440, 1920];

test('manager edits the closing time on the settings page and sees the saved time', async ({
  page,
}) => {
  await loginAdmin(page, 'quanly1');
  await expect(page).toHaveURL(/\/admin\/manager\/settings$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Thông số cơ sở');
  await page.getByLabel('Giờ đóng nhận đơn', { exact: true }).fill('20:00');
  await page.getByRole('button', { name: 'Lưu thông số', exact: true }).click();
  await expect(page.getByText(/^Đã lưu lúc \d\d:\d\d\.$/)).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Giờ đóng nhận đơn', { exact: true })).toHaveValue('20:00');
});

test('the owner-managed well is a read-only list with no input', async ({ page }) => {
  await loginAdmin(page, 'quanly1');
  const well = page.getByRole('region', { name: 'Do chủ sở hữu quản lý' });
  await expect(well.getByText('Tên cơ sở')).toBeVisible();
  await expect(well.getByText('Chưa có').first()).toBeVisible();
  await expect(well.locator('input, textarea, select')).toHaveCount(0);
});

test('A5 passes axe, with and without the validation summary @a11y', async ({ page }) => {
  await loginAdmin(page, 'quanly1');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Thông số cơ sở');
  await expectNoA11yViolations(page);
  await page.getByLabel('Giờ mở nhận đơn', { exact: true }).fill('21:00');
  await page.getByLabel('Giờ đóng nhận đơn', { exact: true }).fill('20:00');
  await page.getByRole('button', { name: 'Lưu thông số', exact: true }).click();
  await expect(page.getByRole('heading', { name: /^Có \d+ chỗ cần sửa$/ })).toBeFocused();
  await expectNoA11yViolations(page);
});

test('a manager is sent to the forbidden page from the owner area', async ({ page }) => {
  await loginAdmin(page, 'quanly1');
  await page.goto('owner/branches');
  await expect(page).toHaveURL(/\/admin\/forbidden$/);
  await page.goto('owner/branches/019a5dc0-0003-7000-8000-000000000003');
  await expect(page).toHaveURL(/\/admin\/forbidden$/);
});

test('A5 never scrolls sideways from 320 to 1920', async ({ page }) => {
  await loginAdmin(page, 'quanly1');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Thông số cơ sở');
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 800 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});
