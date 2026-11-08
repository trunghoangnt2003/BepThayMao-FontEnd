# Chuẩn UI bắt buộc

- Spartan UI + Tailwind CSS 4 là nền tảng UI duy nhất; xem ADR-0011 ở repo docs.
- Dùng `@bepthaymao/ui` cho primitive đã có. Sinh primitive còn thiếu bằng CLI Spartan đã pin, theo `components.json`; không viết lại dialog/select/tooltip bằng thao tác DOM.
- Chỉ sinh component cần dùng. Đặt layout/navigation dùng chung trong `projects/ui/src/lib`; product/cart/checkout thuộc feature tương ứng, không đưa API hoặc quyền nghiệp vụ vào primitive.
- Token nguồn: `projects/ui/src/styles/tokens.css`; ánh xạ semantic Spartan và breakpoint trong `spartan-theme.css`. Không hardcode màu hoặc radius tại page.
- Angular 22 mặc định standalone và OnPush. Signals cho trạng thái cục bộ; route tiếp tục lazy-load; customer tiếp tục SSR.
- Label rõ ràng, focus-visible, bàn phím, touch target 44px, reduced-motion. Trạng thái loading dùng aria-busy và khóa hành động thực; không chỉ làm mờ bằng CSS.
- Lucide mang ISC: không tích hợp trước khi có ngoại lệ giấy phép được ghi nhận.
- Không thêm Material/PrimeNG/NG-ZORRO/Zard hoặc framework UI khác.
- Mỗi thay đổi phải qua lint 0 warning, typecheck, unit test, build và E2E/a11y phù hợp. Không tuyên bố đạt Lighthouse khi chưa đo.
