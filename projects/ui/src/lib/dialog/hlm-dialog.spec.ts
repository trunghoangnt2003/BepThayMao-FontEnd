import { ApplicationRef, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrnDialogRef, BrnDialogService } from '@spartan-ng/brain/dialog';
import { HLM_DIALOG_OPTIONS, HlmDialog, HlmDialogDescription, HlmDialogTitle } from './hlm-dialog';

@Component({
  imports: [HlmDialog, HlmDialogTitle, HlmDialogDescription],
  template: `
    <hlm-dialog>
      <h2 hlmDialogTitle>Tiêu đề thử</h2>
      <p hlmDialogDescription>Nội dung thử</p>
      <button type="button" id="first">Đầu tiên</button>
      <button type="button" id="safe" data-autofocus>An toàn</button>
    </hlm-dialog>
  `,
})
class Probe {
  readonly ready = true;
}

async function settle(): Promise<void> {
  await TestBed.inject(ApplicationRef).whenStable();
}

async function open(): Promise<{ ref: BrnDialogRef; opener: HTMLButtonElement }> {
  const opener = document.createElement('button');
  document.body.appendChild(opener);
  opener.focus();
  const ref = TestBed.inject(BrnDialogService).open(Probe, undefined, {}, HLM_DIALOG_OPTIONS);
  await settle();
  return { ref, opener };
}

afterEach(() => {
  document.body.replaceChildren();
});

describe('HlmDialog', () => {
  it('opens a modal dialog labelled by its title and described by its text', async () => {
    const { ref } = await open();
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    const labelledBy = dialog?.getAttribute('aria-labelledby') ?? '';
    expect(document.getElementById(labelledBy)?.textContent).toBe('Tiêu đề thử');
    const describedBy = dialog?.getAttribute('aria-describedby') ?? '';
    expect(document.getElementById(describedBy)?.textContent).toBe('Nội dung thử');
    ref.forceClose();
  });

  it('styles the pane and the scrim with the Garden classes', async () => {
    const { ref } = await open();
    expect(document.querySelector('.cdk-overlay-pane.hlm-dialog-pane')).not.toBeNull();
    expect(document.querySelector('.cdk-overlay-backdrop.hlm-dialog-backdrop')).not.toBeNull();
    expect(document.querySelector('hlm-dialog')?.classList.contains('hlm-dialog')).toBe(true);
    expect(document.querySelector('h2')?.classList.contains('hlm-dialog__title')).toBe(true);
    ref.forceClose();
  });

  it('puts focus on the safe control marked data-autofocus, not the first tabbable one', async () => {
    const { ref } = await open();
    expect(document.activeElement?.id).toBe('safe');
    ref.forceClose();
  });

  it('closes on Escape and returns focus to the element that opened it', async () => {
    const { ref, opener } = await open();
    document
      .querySelector('[role="dialog"]')
      ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle();
    await vi.waitFor(() => {
      expect(ref.open).toBe(false);
    });
    await settle();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });
});
