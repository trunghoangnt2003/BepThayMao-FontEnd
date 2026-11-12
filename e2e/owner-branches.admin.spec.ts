import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './support/a11y';
import { loginAdmin } from './support/admin-login';

test('owner creates a branch with a manager account and sees it in the list', async ({ page }) => {
  const name = `Cơ sở E2E ${Date.now().toString()}`;
  await loginAdmin(page);
  await page.goto('owner/branches');
  await page.getByRole('link', { name: 'Tạo cơ sở mới' }).click();
  await expect(page).toHaveURL(/\/admin\/owner\/branches\/new$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tạo cơ sở mới');
  await page.getByLabel('Tên cơ sở', { exact: true }).fill(name);
  await page.getByLabel('Địa chỉ', { exact: true }).fill('Số 9 Đường Mẫu');
  await page.getByLabel('Số điện thoại', { exact: true }).fill('0901 234 567');
  await page.getByLabel('Vĩ độ', { exact: true }).fill('10.7769');
  await page.getByLabel('Kinh độ', { exact: true }).fill('106.7009');
  await page.getByLabel('Tên đăng nhập của quản lý', { exact: true }).fill('quanly-e2e');
  await page.getByRole('button', { name: 'Tạo mật khẩu ngẫu nhiên' }).click();
  await expect(page.getByLabel('Mật khẩu', { exact: true })).toHaveValue(/^[A-Za-z0-9]{16}$/);
  await page.getByRole('button', { name: 'Tạo cơ sở', exact: true }).click();
  const heading = page.getByRole('heading', { level: 1 });
  await expect(heading).toHaveText(`Đã tạo cơ sở ${name}`);
  await expect(heading).toBeFocused();
  await expect(page.getByText('quanly-e2e', { exact: true })).toBeVisible();
  expect(
    await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length })),
  ).toEqual({ local: 0, session: 0 });
  await page.getByRole('link', { name: 'Về danh sách cơ sở' }).click();
  await expect(page).toHaveURL(/\/admin\/owner\/branches$/);
  await expect(page.getByRole('link', { name, exact: true })).toBeVisible();
});

test('owner branches screens have no axe violations @a11y', async ({ page }) => {
  await loginAdmin(page);
  await page.goto('owner/branches');
  await expect(page.getByRole('link', { name: 'Tạo cơ sở mới' })).toBeVisible();
  await expectNoA11yViolations(page);
});
