# Chuẩn UI bắt buộc

- **Ưu tiên cao nhất về thiết kế customer: responsive mobile-first cho khách mua xôi.** Thiết kế và review điện thoại trước, tablet/desktop sau; không thu nhỏ layout desktop để coi là xong. Accessibility và nghiệp vụ đúng là điều kiện bắt buộc.
- Tuân thủ [quy tắc mobile-first](docs/mobile-first-design.md): từ 320px, ưu tiên 360–390px; CTA dễ chạm, ảnh/giá/món rõ, checkout một cột, sticky không che nội dung hoặc bàn phím. UI mobile lỗi thì chưa được nghiệm thu.
- Spartan UI + Tailwind CSS 4 là nền tảng UI duy nhất; xem ADR-0011 ở repo docs.
- Dùng `@bepthaymao/ui` cho primitive đã có. Primitive còn thiếu thêm vào `projects/ui/src/lib` theo mẫu helm hiện có (button, dialog, input, label) trên Spartan brain; không viết lại dialog/select/tooltip bằng thao tác DOM.
- Chỉ sinh component cần dùng. Đặt layout/navigation dùng chung trong `projects/ui/src/lib`; product/cart/checkout thuộc feature tương ứng, không đưa API hoặc quyền nghiệp vụ vào primitive.
- Token nguồn: `projects/ui/src/styles/tokens.css` (kèm `base.css`, `dialog.css`). Không hardcode màu hoặc radius tại page.
- Angular 22 mặc định standalone và OnPush. Signals cho trạng thái cục bộ; route tiếp tục lazy-load; customer tiếp tục SSR.
- Label rõ ràng, focus-visible, bàn phím, touch target 44px, reduced-motion. Trạng thái loading dùng aria-busy và khóa hành động thực; không chỉ làm mờ bằng CSS.
- Lucide mang ISC: không tích hợp trước khi có ngoại lệ giấy phép được ghi nhận.
- Không thêm Material/PrimeNG/NG-ZORRO/Zard hoặc framework UI khác.
- Mỗi thay đổi phải qua lint 0 warning, typecheck, unit test, build và E2E/a11y phù hợp. Không tuyên bố đạt Lighthouse khi chưa đo.
