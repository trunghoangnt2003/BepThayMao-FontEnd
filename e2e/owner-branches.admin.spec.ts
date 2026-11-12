import { expect, Locator, Page, test } from '@playwright/test';
import { expectNoA11yViolations } from './support/a11y';
import { loginAdmin } from './support/admin-login';

async function fillValidBranch(page: Page, name: string): Promise<void> {
  await page.getByLabel('Tên cơ sở', { exact: true }).fill(name);
  await page.getByLabel('Địa chỉ', { exact: true }).fill('Số 9 Đường Mẫu');
  await page.getByLabel('Số điện thoại', { exact: true }).fill('0901 234 567');
  await page.getByLabel('Vĩ độ', { exact: true }).fill('10.7769');
  await page.getByLabel('Kinh độ', { exact: true }).fill('106.7009');
  await page.getByLabel('Tên đăng nhập của quản lý', { exact: true }).fill('quanly-e2e');
  await page.getByRole('button', { name: 'Tạo mật khẩu ngẫu nhiên' }).click();
}

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

/** Native time inputs hold several tab stops (hour, minute); keep tabbing until the next field. */
async function tabUntilFocused(page: Page, target: Locator): Promise<void> {
  for (let press = 0; press < 4; press++) {
    await page.keyboard.press('Tab');
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }
  await expect(target).toBeFocused();
}

const WIDTHS = [320, 375, 768, 1024, 1440, 1920];

async function expectNoHorizontalScroll(page: Page): Promise<void> {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test('A2 list, empty list, A3 form and success screen pass axe @a11y', async ({ page }) => {
  await loginAdmin(page);
  await page.goto('owner/branches');
  await expect(page.getByRole('link', { name: 'Tạo cơ sở mới' })).toBeVisible();
  await expectNoA11yViolations(page);
  await page.goto('owner/branches/new');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tạo cơ sở mới');
  await expectNoA11yViolations(page);
  await page.getByRole('button', { name: 'Tạo cơ sở', exact: true }).click();
  await expect(page.getByRole('heading', { name: /^Có \d+ chỗ cần sửa$/ })).toBeFocused();
  await expectNoA11yViolations(page);
  await fillValidBranch(page, `Cơ sở Axe ${Date.now().toString()}`);
  await page.getByRole('button', { name: 'Tạo cơ sở', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Đã tạo cơ sở');
  await expectNoA11yViolations(page);
});

test('A2 empty state passes axe and offers one primary action @a11y', async ({ page }) => {
  await loginAdmin(page, 'owner-empty');
  await page.goto('owner/branches');
  await expect(page.getByRole('heading', { name: 'Chưa có cơ sở nào' })).toBeVisible();
  await expect(page.getByText('Tạo cơ sở đầu tiên để cấp tài khoản cho quản lý.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Tạo cơ sở mới' })).toHaveCount(1);
  await expectNoA11yViolations(page);
});

test('A3 is completed in visual order with Tab, Shift+Tab and Enter @a11y', async ({ page }) => {
  await loginAdmin(page);
  await page.goto('owner/branches/new');
  const order = [
    'branch-name',
    'branch-address',
    'branch-phone',
    'branch-lat',
    'branch-lng',
    'branch-open',
    'branch-close',
    'branch-threshold',
    'branch-zalo',
    'branch-bank-code',
    'branch-bank-account',
    'branch-sepay',
    'manager-identifier',
    'manager-password',
  ];
  await page.locator('#branch-name').focus();
  for (const id of order.slice(1)) await tabUntilFocused(page, page.locator(`#${id}`));
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Hiện mật khẩu' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Tạo mật khẩu ngẫu nhiên' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Tạo cơ sở', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Bỏ tạo cơ sở' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: /^Có \d+ chỗ cần sửa$/ })).toBeFocused();
});

test('A2 keeps table semantics when it reflows at 320px and nothing scrolls sideways', async ({
  page,
}) => {
  await loginAdmin(page);
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('owner/branches');
    await expect(page.getByRole('table')).toBeVisible();
    await expectNoHorizontalScroll(page);
    await page.goto('owner/branches/new');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expectNoHorizontalScroll(page);
  }
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('owner/branches');
  expect(await page.getByRole('row').count()).toBeGreaterThan(1);
  expect(await page.getByRole('cell').count()).toBeGreaterThan(1);
  expect(await page.getByRole('rowheader').count()).toBeGreaterThan(0);
  await expect(page.getByRole('table')).toHaveAttribute('role', 'table');
});

test('manager account rejects an accented identifier and a duplicate one', async ({ page }) => {
  await loginAdmin(page);
  await page.goto('owner/branches/new');
  await fillValidBranch(page, `Cơ sở Lỗi ${Date.now().toString()}`);
  const identifier = page.getByLabel('Tên đăng nhập của quản lý', { exact: true });
  await identifier.fill('quản-lý');
  await identifier.blur();
  await expect(page.locator('#manager-identifier-note')).toContainText('chỉ gồm chữ không dấu');
  await identifier.fill('trung-ten');
  await page.getByRole('button', { name: 'Tạo cơ sở', exact: true }).click();
  await expect(page.locator('#manager-identifier-note')).toHaveText(
    'Tên đăng nhập này đã có người dùng. Chọn tên khác.',
  );
});
