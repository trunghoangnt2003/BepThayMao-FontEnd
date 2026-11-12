import { expect, test } from '@playwright/test';
import { loginAdmin } from './support/admin-login';

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
