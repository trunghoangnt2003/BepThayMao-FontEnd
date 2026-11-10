/** Vietnamese phone to an E.164 tel: link: strips spaces/dots, leading 0 becomes +84. */
export function toTelHref(phone: string): string {
  const digits = phone.replace(/[\s.]/g, '');
  return `tel:${digits.startsWith('0') ? `+84${digits.slice(1)}` : digits}`;
}
