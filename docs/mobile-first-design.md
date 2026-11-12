# Thiết kế mobile-first

Customer bắt đầu ở 320px, một cột; từ 60rem mới mở thành hai cột. Không đặt chiều rộng tối thiểu làm tràn màn hình. Grid dùng `minmax(0, …)`, nội dung địa chỉ dài được xuống dòng. Container có giới hạn; desktop tăng gutter, không kéo giãn chữ vô hạn.

Mọi màu/font dùng token trong `projects/ui/src/styles/tokens.css`. Hệ "Chanh muối" (quyết định 2026-11-12, thay Garden): khách kiểu app giao đồ ăn với dải đầu trang xanh chanh và thẻ trắng, admin trung tính một màu nhấn; font Be Vietnam Pro 400/600/700/800 tự host đủ tiếng Việt. Chữ trên nền chanh luôn là màu mực để giữ tương phản. Điều khiển cao tối thiểu 44px, focus hiện tức thì. Không dựa vào hover hoặc màu để truyền thông tin. Tôn trọng reduced motion.

Customer SSR phải có nội dung và liên kết điện thoại khi tắt JavaScript. Admin SPA có noscript rõ ràng; bảng giữ role/tiêu đề khi xếp lại ở mobile. Đổi route admin đưa focus vào h1 sau lần điều hướng đầu.

Chạy `npm run e2e`: viewport 320, 375, 768, 1024, 1440, 1920; không tràn ngang; axe WCAG 2.2 AA; keyboard skip link; ảnh tại `test-results`. Kiểm bằng mắt ảnh mobile và font. Zoom/reflow và trình đọc màn hình phải kiểm riêng, không suy ra từ axe. Quy ước chi tiết và chuỗi giao diện theo UI-SPEC của phase 01 trong repo docs.
