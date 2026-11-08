# Quy tắc thiết kế web bán xôi: ưu tiên điện thoại

Áp dụng bắt buộc theo yêu cầu chủ dự án ngày 2026-11-09 cho mọi tính năng mới và mọi thay đổi UI customer. Đây là tiêu chí nghiệm thu, không chỉ là hướng dẫn CSS.

## Thứ tự ưu tiên

1. Thiết kế và kiểm chứng luồng mua xôi trên điện thoại trước.
2. Mở rộng cùng luồng đó lên tablet, sau đó desktop.
3. Chỉ thêm hiệu ứng hoặc trang trí sau khi thao tác mua hàng rõ ràng, dễ chạm và nhanh.

Khi bố cục desktop và trải nghiệm điện thoại xung đột, ưu tiên điện thoại. Accessibility, tính đúng đắn nghiệp vụ và bảo mật vẫn là điều kiện bắt buộc ở mọi kích thước. Không lấy giao diện desktop rồi thu nhỏ để coi là đã đáp ứng mobile.

Admin vẫn phải responsive và thao tác được trên điện thoại; màn hình quản trị nhiều dữ liệu được tối ưu riêng theo công việc. Không áp kiểu bảng desktop của admin cho trang khách mua hàng.

## Bố cục và điều hướng

- Bắt đầu thiết kế ở 360–390 CSS px; phải dùng được ở 320px. Bổ sung kiểm tra 430px, tablet 768px và desktop 1440px. Đây là viewport kiểm chứng, không phải các breakpoint CSS mới.
- Tailwind không prefix là bố cục mobile; dùng các breakpoint token hiện có để mở rộng. Không tự tạo bộ breakpoint cho từng page.
- Ưu tiên một cột cho nội dung mua hàng và checkout; tăng cột khi nội dung thực sự đủ chỗ. Không đặt chiều rộng cố định gây tràn ngang hoặc bắt người dùng xoay máy.
- Điều hướng ngắn, nhãn tiếng Việt rõ; các hành động chính dùng được bằng chạm, không phụ thuộc hover. Giữ Back, deep link và trạng thái lựa chọn khi quay lại theo luồng nghiệp vụ.
- Cho phép cuộn ngang có chủ đích ở bộ lọc/danh mục khi có dấu hiệu rõ, nhưng không để toàn trang tràn ngang. Nội dung bắt buộc không được nằm ngoài vùng nhìn thấy.

## Luồng mua xôi

- Khi triển khai thực đơn: ưu tiên tên món, ảnh món thật, giá, tình trạng còn/hết và nút chọn món. Không để banner lớn hoặc hiệu ứng đẩy nội dung mua hàng xuống nhiều màn hình.
- Topping, số lượng, ghi chú và cơ sở phải rõ trước khi thêm vào giỏ theo nghiệp vụ đã chốt. Không tự thêm bước đăng nhập hoặc thay đổi điều kiện mua hàng.
- Giỏ hàng và checkout phải dễ tìm trên điện thoại. Khi dùng thanh CTA cố định ở đáy, hiển thị hành động và tổng tiền đúng trạng thái hiện tại; chừa khoảng nội dung và safe-area tương ứng.
- Hiển thị rõ giá món, phụ phí/phí giao hàng, tổng thanh toán và thông tin giao/nhận theo dữ liệu thực. Không giấu thông tin cần quyết định mua hàng trên mobile.
- Giữ một CTA chính cho mỗi bước. Thao tác sửa/xóa/hủy phải phân biệt rõ với đặt hàng; không đặt hành động phá hủy sát CTA chính.
- Không tạo page, dữ liệu hoặc luồng giả chỉ để minh họa các quy tắc này. Áp dụng khi feature tương ứng được triển khai.

## Chạm, chữ và form

- Vùng chạm tối thiểu 44×44 CSS px; CTA mua hàng ưu tiên cao 48px trở lên. Các hành động cạnh nhau cách tối thiểu 8px. Dùng token chung, không sao chép kích thước rời rạc.
- Nội dung thân và chữ trong input tối thiểu 16px; không vô hiệu hóa zoom. Tên món, giá và lỗi không bị cắt mất ý nghĩa khi chữ lớn hoặc màn hình hẹp.
- Form có label hiển thị, autocomplete và kiểu bàn phím phù hợp dữ liệu; không dùng placeholder thay label. Lỗi nằm gần trường, giữ dữ liệu đã nhập và có hướng khắc phục.
- Bàn phím ảo, header cố định, bottom bar và dialog không được che input đang nhập, thông báo lỗi hoặc CTA. Kiểm tra safe-area, cuộn và đổi chiều màn hình.
- Spartan UI là mặc định cho control tương ứng; dùng token Garden, focus-visible và reduced-motion chung. Loading phải ngăn gửi trùng và có phản hồi rõ; trạng thái lỗi có cách thử lại khi phù hợp.

## Ảnh và tốc độ

- Ảnh xôi/món ăn phải rõ và đúng sản phẩm, có alt phù hợp, kích thước giữ chỗ và nguồn ảnh responsive. Dùng NgOptimizedImage theo quy ước Angular; tránh tải ảnh desktop nguyên kích thước cho điện thoại.
- Chỉ ưu tiên tải ảnh quan trọng đầu trang; ảnh phía dưới lazy-load. Không thêm carousel tự chạy, video nền hoặc thư viện animation nặng làm chậm việc chọn món.
- Giữ customer SSR, lazy route và chỉ import component cần dùng. Mục tiêu Lighthouse trên mobile: Performance ≥90, Accessibility ≥95, Best Practices ≥95, SEO ≥90 cho trang công khai có thể index; phải đo mới được báo đạt.

## Cổng nghiệm thu bắt buộc

- Review mobile trước desktop; PR/thay đổi UI phải kèm ảnh hoặc bằng chứng kiểm tra các viewport liên quan, tối thiểu 320px và 390px cho màn hình customer thay đổi.
- Kiểm tra ở 320/360/390/430px khi phát triển; kiểm tra thêm 768/1440px trước khi nghiệm thu. Dùng preset dùng chung khi mở rộng test E2E, không nhân đôi test không cần thiết.
- Chạy luồng thực của feature trên điện thoại: nội dung không tràn ngang; CTA, option, tổng tiền và lỗi dùng được; không có thao tác chỉ dành cho chuột.
- Kiểm tra bàn phím, focus, zoom/chữ lớn, loading/empty/error/full, bàn phím ảo và sticky/safe-area nếu màn hình có dùng. Axe tự động không thay thế việc kiểm tra thao tác thực.
- E2E cho luồng thay đổi phải có viewport mobile. Với thay đổi UI đáng kể, kiểm tra thêm trình duyệt mobile thực hoặc giả lập có ghi rõ giới hạn; không coi Chrome desktop thu hẹp cửa sổ là bằng chứng đã test Safari iOS.
- Lint 0 error/0 warning, strict typecheck, test và build vẫn bắt buộc. Nếu mobile lỗi hoặc chưa có bằng chứng kiểm chứng liên quan, không báo UI đã hoàn tất dù desktop chạy đúng.

Tài liệu này đặt quy tắc cho công việc tiếp theo; không khẳng định các luồng thương mại chưa triển khai đã được kiểm thử.
