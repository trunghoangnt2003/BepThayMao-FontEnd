import { ApiError } from '@bepthaymao/core';

/** Fixed, mapped text for a failed request; never the raw server `detail`. */
export function failureText(error: ApiError, fallback: string): string {
  const code = error.correlationId
    ? ` Nếu vẫn lỗi, gửi mã ${error.correlationId} cho đội phát triển.`
    : '';
  if (error.kind === 'network') return 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
  if (error.status === 429) return 'Bạn thao tác quá nhanh. Đợi một chút rồi thử lại.';
  if (error.status >= 500) return `Máy chủ gặp lỗi. Hãy thử lại sau ít phút.${code}`;
  return `${fallback}${code}`;
}
