import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ConfirmDialog } from './confirm-dialog';

const options = {
  title: 'Tắt nhận đơn cơ sở Cơ sở Mẫu 1?',
  body: 'Cơ sở sẽ không được gán đơn mới cho tới khi bạn bật lại.',
  confirmLabel: 'Tắt nhận đơn',
  cancelLabel: 'Giữ nguyên',
  danger: true,
};

async function settle(): Promise<void> {
  await TestBed.inject(ApplicationRef).whenStable();
}

function buttons(): HTMLButtonElement[] {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('[role="dialog"] button'));
}

function click(text: string): void {
  const button = buttons().find((candidate) => candidate.textContent.trim() === text);
  if (!button) throw new Error(`No dialog button named "${text}"`);
  button.click();
}

async function ask(
  overrides: Partial<typeof options> = {},
): Promise<{ answer: Promise<boolean>; opener: HTMLButtonElement }> {
  const opener = document.createElement('button');
  opener.textContent = 'Tắt nhận đơn';
  document.body.appendChild(opener);
  opener.focus();
  const answer = TestBed.inject(ConfirmDialog).confirm({ ...options, ...overrides });
  await settle();
  return { answer, opener };
}

afterEach(() => {
  document.body.replaceChildren();
});

it('opens a modal named by the title with the body as its description', async () => {
  const { answer } = await ask();
  const dialog = document.querySelector('[role="dialog"]');
  expect(dialog?.getAttribute('aria-modal')).toBe('true');
  expect(document.getElementById(dialog?.getAttribute('aria-labelledby') ?? '')?.textContent).toBe(
    options.title,
  );
  expect(document.getElementById(dialog?.getAttribute('aria-describedby') ?? '')?.textContent).toBe(
    options.body,
  );
  click('Giữ nguyên');
  await answer;
});

it('lists cancel before confirm in the DOM and focuses the safe cancel control', async () => {
  const { answer } = await ask();
  expect(buttons().map((button) => button.textContent.trim())).toEqual([
    'Giữ nguyên',
    'Tắt nhận đơn',
  ]);
  expect(document.activeElement).toBe(buttons()[0]);
  click('Giữ nguyên');
  await answer;
});

it('resolves true on confirm and false on cancel', async () => {
  const yes = await ask();
  click('Tắt nhận đơn');
  expect(await yes.answer).toBe(true);
  await settle();
  const no = await ask();
  click('Giữ nguyên');
  expect(await no.answer).toBe(false);
});

it('resolves false on Escape and returns focus to the opener', async () => {
  const { answer, opener } = await ask();
  document
    .querySelector('[role="dialog"]')
    ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  expect(await answer).toBe(false);
  await settle();
  await vi.waitFor(() => {
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });
  expect(document.activeElement).toBe(opener);
});

it('marks a dangerous confirm button with the danger style and a plain one with the primary style', async () => {
  const danger = await ask();
  const [, confirm] = buttons();
  expect(confirm.classList.contains('btn--danger')).toBe(true);
  expect(confirm.classList.contains('btn--primary')).toBe(false);
  click('Giữ nguyên');
  await danger.answer;
  await settle();
  const plain = await ask({ danger: false, confirmLabel: 'Rời trang', cancelLabel: 'Ở lại' });
  expect(buttons()[1].classList.contains('btn--primary')).toBe(true);
  click('Ở lại');
  await plain.answer;
});
