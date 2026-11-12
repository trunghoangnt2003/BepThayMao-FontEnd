const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

export function generatePassword(length = 16): string {
  // Rejection sampling keeps every character equally likely (no modulo bias).
  const limit = 256 - (256 % ALPHABET.length);
  let result = '';
  while (result.length < length) {
    for (const byte of crypto.getRandomValues(new Uint8Array(length))) {
      if (byte < limit && result.length < length) result += ALPHABET.charAt(byte % ALPHABET.length);
    }
  }
  return result;
}
