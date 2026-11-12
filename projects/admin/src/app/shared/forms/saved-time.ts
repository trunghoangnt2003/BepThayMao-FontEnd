const clock = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'Asia/Ho_Chi_Minh',
});

/** Clock time `HH:mm` in Ho Chi Minh time, as shown in "Đã lưu lúc HH:mm.". */
export function savedTime(at: Date = new Date()): string {
  return clock.format(at);
}
