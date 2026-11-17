import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MotionPreference } from './motion-preference';

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.classList.remove('anim');
});

describe('MotionPreference', () => {
  it('is always on in the browser and marks <html> with anim', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn() }));
    const motion = TestBed.inject(MotionPreference);
    TestBed.tick();
    expect(motion.enabled()).toBe(true);
    expect(document.documentElement.classList.contains('anim')).toBe(true);
  });

  it('stays off on the server so the first HTML is static', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const motion = TestBed.inject(MotionPreference);
    TestBed.tick();
    expect(motion.enabled()).toBe(false);
    expect(document.documentElement.classList.contains('anim')).toBe(false);
  });
});
