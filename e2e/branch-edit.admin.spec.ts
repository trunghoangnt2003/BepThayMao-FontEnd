import { expect, Page, test } from '@playwright/test';
import { expectNoA11yViolations } from './support/a11y';
import { loginAdmin } from './support/admin-login';

const WIDTHS = [320, 375, 768, 1024, 1440, 1920];
const BRANCH_URL = 'owner/branches/019a5dc0-0003-7000-8000-000000000003';

async function expectNoHorizontalScroll(page: Page): Promise<void> {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

async function openEditor(page: Page): Promise<void> {
  await loginAdmin(page);
  await page.goto(BRANCH_URL);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Cơ sở Mẫu 3');
}

test('owner opens a branch from the list, edits the name and sees the saved time @a11y', async ({
  page,
}) => {
  await loginAdmin(page);
  await page.goto('owner/branches');
  await page.getByRole('link', { name: 'Cơ sở Mẫu 3', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/owner\/branches\/019a5dc0-0003-/);
  await expect(page.getByLabel('Tên cơ sở', { exact: true })).toHaveValue('Cơ sở Mẫu 3');
  await expectNoA11yViolations(page);
  const name = `Cơ sở Mẫu 3 ${Date.now().toString()}`;
  await page.getByLabel('Tên cơ sở', { exact: true }).fill(name);
  await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click();
  await expect(page.getByText(/^Đã lưu lúc \d\d:\d\d\.$/)).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(name);
});

test('turning orders off asks first, keeps focus safe and returns it on Escape @a11y', async ({
  page,
}) => {
  await openEditor(page);
  const toggle = page.getByRole('button', { name: 'Tắt nhận đơn', exact: true });
  await toggle.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: /^Tắt nhận đơn cơ sở / })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Giữ nguyên', exact: true })).toBeFocused();
  await expectNoA11yViolations(page);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(toggle).toBeFocused();
  await expect(page.getByText('Cơ sở đang nhận đơn.')).toBeVisible();
  await toggle.click();
  await dialog.getByRole('button', { name: 'Tắt nhận đơn', exact: true }).click();
  await expect(page.getByText('Cơ sở đã tắt nhận đơn.')).toBeVisible();
  await page.getByRole('button', { name: 'Bật nhận đơn', exact: true }).click();
  await expect(page.getByText('Cơ sở đang nhận đơn.')).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('resetting the manager password shows it once and forgets it @a11y', async ({ page }) => {
  await openEditor(page);
  const opener = page.getByRole('button', { name: 'Đặt lại mật khẩu', exact: true });
  await opener.click();
  const dialog = page.getByRole('dialog');
  const field = dialog.getByLabel('Mật khẩu mới', { exact: true });
  await expect(field).toBeFocused();
  await expectNoA11yViolations(page);
  await field.fill('123456789');
  await dialog.getByRole('button', { name: 'Đặt lại mật khẩu', exact: true }).click();
  await expect(dialog.getByText('Mật khẩu cần ít nhất 10 ký tự.')).toBeVisible();
  await dialog.getByRole('button', { name: 'Tạo mật khẩu ngẫu nhiên' }).click();
  await expect(field).toHaveValue(/^[A-Za-z0-9]{16}$/);
  const password = await field.inputValue();
  await dialog.getByRole('button', { name: 'Đặt lại mật khẩu', exact: true }).click();
  await expect(dialog.getByRole('heading', { name: 'Đã đặt lại mật khẩu' })).toBeVisible();
  await expect(dialog.getByText(password, { exact: true })).toBeVisible();
  await expectNoA11yViolations(page);
  expect(
    await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length })),
  ).toEqual({ local: 0, session: 0 });
  await dialog.getByRole('button', { name: 'Đóng', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  await expect(page.getByText(password)).toHaveCount(0);
});

test('an unknown branch id shows the not-found screen with a way back @a11y', async ({ page }) => {
  await loginAdmin(page);
  await page.goto('owner/branches/does-not-exist');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Không tìm thấy cơ sở này');
  await expect(page.getByRole('link', { name: 'Về danh sách cơ sở' })).toBeVisible();
  await expectNoA11yViolations(page);
});

test('leaving with an unsaved edit asks first and "Ở lại" is the default @a11y', async ({
  page,
}) => {
  await openEditor(page);
  await page.getByLabel('Địa chỉ', { exact: true }).fill('Địa chỉ chưa lưu');
  await page.getByRole('link', { name: 'Cơ sở', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Rời trang này?' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Ở lại', exact: true })).toBeFocused();
  await expectNoA11yViolations(page);
  await dialog.getByRole('button', { name: 'Ở lại', exact: true }).click();
  await expect(page).toHaveURL(/\/owner\/branches\/019a5dc0-0003-/);
  await expect(page.getByLabel('Địa chỉ', { exact: true })).toHaveValue('Địa chỉ chưa lưu');
  await page.getByRole('link', { name: 'Cơ sở', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Rời trang', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/owner\/branches$/);
});

test('A4 and its dialogs never scroll sideways from 320 to 1920', async ({ page }) => {
  await openEditor(page);
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 800 });
    await expectNoHorizontalScroll(page);
  }
  await page.setViewportSize({ width: 320, height: 568 });
  await page.getByRole('button', { name: 'Đặt lại mật khẩu', exact: true }).click();
  await expectNoHorizontalScroll(page);
  const dialog = page.getByRole('dialog');
  const box = await dialog.boundingBox();
  expect(box?.x).toBeGreaterThanOrEqual(0);
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(320);
});
