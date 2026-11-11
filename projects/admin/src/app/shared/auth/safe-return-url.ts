export function safeReturnUrl(raw: string | null): string | null {
  return raw === null ? raw : null;
}
