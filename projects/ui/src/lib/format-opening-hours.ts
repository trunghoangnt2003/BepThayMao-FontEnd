export function formatOpeningHours(openTime: string, closeTime: string): string {
  return `${openTime.slice(0, 5)} đến ${closeTime.slice(0, 5)}`;
}
