# Spartan UI và Tailwind CSS 4

Theo ADR-0011, brain dùng `@spartan-ng/brain` 1.9.0 (hỗ trợ Angular 21–22). Helm được sở hữu tại `projects/ui/src/lib/button/hlm-button.ts`, điều chỉnh từ template MIT của Spartan CLI 1.9.0 cho đúng token Garden. Chỉ thêm button vì các trang hiện tại cần nút/link chính; không sinh trước dialog/form chưa dùng.

Button giữ host directive BrnButton để xử lý disabled; kiểu dáng dùng token và luật focus dùng chung. Tailwind 4 qua PostCSS; CSS Foundation không bị thay bằng theme mặc định. Không dùng Lucide/ISC trong UI. CLI sinh mã không nằm trong dependency thường trực, tránh kéo Nx vào workspace Angular CLI.

Client Orval là mã sinh, không sửa tay. Các component gọi data-access. Test UI phải đạt lint, typecheck, coverage, build, E2E/axe; audit dependencies phải sạch.
