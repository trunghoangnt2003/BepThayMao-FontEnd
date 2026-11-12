export function toTelHref(phone: string): string {
  const normalized = phone.replace(/[\s.]/g, '');
  return `tel:${normalized.startsWith('0') ? '+84' + normalized.slice(1) : normalized}`;
}
