export function safeReturnUrl(raw: string | null): string | null {
  return raw &&
    raw.startsWith('/') &&
    !raw.startsWith('//') &&
    !raw.includes('\\') &&
    !raw.includes('://') &&
    !Array.from(raw).some((character) => character.charCodeAt(0) <= 32)
    ? raw
    : null;
}
