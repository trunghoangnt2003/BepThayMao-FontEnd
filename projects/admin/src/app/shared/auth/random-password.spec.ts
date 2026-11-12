import { generatePassword } from './random-password';

describe('generatePassword', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 16 characters by default, none of them confusable', () => {
    for (let run = 0; run < 200; run++) {
      const password = generatePassword();
      expect(password).toHaveLength(16);
      expect(password).toMatch(/^[A-HJ-NP-Za-km-z2-9]{16}$/);
      expect(password).not.toMatch(/[0O1lI]/);
    }
  });

  it('draws its randomness from crypto.getRandomValues', () => {
    const spy = vi.spyOn(crypto, 'getRandomValues');
    generatePassword();
    expect(spy).toHaveBeenCalled();
  });

  it('gives different passwords on consecutive calls', () => {
    expect(generatePassword()).not.toBe(generatePassword());
  });

  it('honours a requested length', () => {
    expect(generatePassword(24)).toHaveLength(24);
  });
});
