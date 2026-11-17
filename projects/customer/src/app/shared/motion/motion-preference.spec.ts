import { TestBed } from '@angular/core/testing';
import { MotionPreference } from './motion-preference';

function stubReduced(matches: boolean): void {
  vi.stubGlobal('matchMedia', () => ({ matches, addEventListener: vi.fn() }));
}

function create(): MotionPreference {
  const service = TestBed.inject(MotionPreference);
  TestBed.tick();
  return service;
}

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
  document.documentElement.classList.remove('anim');
});

describe('MotionPreference', () => {
  it('follows the device setting and offers to enable when motion is reduced', () => {
    stubReduced(true);
    const motion = create();
    expect(motion.enabled()).toBe(false);
    expect(motion.offerEnable()).toBe(true);
    expect(document.documentElement.classList.contains('anim')).toBe(false);
  });

  it('turns animation on, remembers the choice and stops offering', () => {
    stubReduced(true);
    const motion = create();
    motion.enable();
    TestBed.tick();
    expect(motion.enabled()).toBe(true);
    expect(motion.offerEnable()).toBe(false);
    expect(localStorage.getItem('btm-motion')).toBe('true');
    expect(document.documentElement.classList.contains('anim')).toBe(true);
  });

  it('toggles against the device setting and reads a saved choice back', () => {
    stubReduced(false);
    localStorage.setItem('btm-motion', 'false');
    const motion = create();
    expect(motion.enabled()).toBe(false);
    motion.toggle();
    expect(motion.enabled()).toBe(true);
    expect(motion.forced()).toBe(true);
  });

  it('ignores a corrupted saved value', () => {
    stubReduced(false);
    localStorage.setItem('btm-motion', '{oops');
    const motion = create();
    expect(motion.forced()).toBeNull();
    expect(motion.enabled()).toBe(true);
  });
});
