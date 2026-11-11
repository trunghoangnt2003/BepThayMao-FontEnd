import { TestBed } from '@angular/core/testing';
import { AccessTokenStore } from './access-token-store';

it('keeps session and token in memory and clears them without browser storage', () => {
  const local = vi.spyOn(Storage.prototype, 'setItem');
  const store = TestBed.inject(AccessTokenStore);
  expect(store.accessToken()).toBeNull();
  store.set({ accessToken: 'test-token', identifier: 'owner', role: 'Owner' });
  expect(store.accessToken()).toBe('test-token');
  expect(store.session()).toEqual({ identifier: 'owner', role: 'Owner' });
  store.clear();
  expect(store.accessToken()).toBeNull();
  expect(store.session()).toBeNull();
  expect(local).not.toHaveBeenCalled();
  local.mockRestore();
});
