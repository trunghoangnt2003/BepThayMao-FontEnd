# Bếp Thầy Mão — Frontend

Angular CLI workspace gồm app `customer` SSR, app `admin` SPA và ba lib
`api-client`, `core`, `ui`. Backend và tài liệu là hai repo riêng theo ADR-0010.

Yêu cầu Node 24.22.2, npm 11. Cài công cụ từ lockfile bằng `npm ci`.

Chạy từng app ở hai terminal: `npm run start:customer` và `npm run start:admin`.
Customer dùng cổng 4200; admin dùng cổng 4201, đường `/admin/`. Backend dev dự
kiến ở cổng 5080; SSR dùng `API_INTERNAL_URL`. Luồng dữ liệu thực tế được bổ
sung ở plan 01-07; skeleton hiện chưa có trang nghiệp vụ.

Cổng chất lượng từ thư mục repo frontend:

```sh
npm run lint
npm run format:check
npm run typecheck
npm test
npm run test:scripts
npm run build
npm run drill
```

`drill` cần repo sạch và Docker Desktop, cố ý tạo vi phạm rồi khôi phục.
Lint không cho warning, typecheck kiểm template và vòng phụ thuộc;
Vitest kiểm coverage 80% statements, 75% branches, 80% functions và lines.
Mỗi app build độc lập bằng `build:customer` hoặc `build:admin`.

Giao diện tuân theo UI-SPEC và hệ thiết kế trong repo BepThayMao-Spec.
Font Vollkorn và Hanken Grotesk tự host, gồm các subset tiếng Việt.
