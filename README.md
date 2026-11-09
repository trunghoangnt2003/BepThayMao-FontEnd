# Bếp Thầy Mão — Frontend

Angular CLI workspace gồm app `customer` SSR, app `admin` SPA và ba lib
`api-client`, `core`, `ui`. Backend và tài liệu là hai repo riêng theo ADR-0010.

Yêu cầu Node 24.22.2, npm 11. Cài công cụ từ lockfile bằng `npm ci`.

Chạy từng app ở hai terminal: `npm run start:customer` và `npm run start:admin`.
Customer dùng cổng 4200; admin dùng cổng 4201, đường `/admin/`. Backend dev dự
kiến ở cổng 5080; SSR dùng `API_INTERNAL_URL`. Customer `/co-so` hiển thị danh sách
cơ sở ngay trong HTML; admin `/admin/branches` hiển thị cùng dữ liệu từ API thật.
Trên Windows qua Traefik, thêm `-- --host 0.0.0.0` cho hai lệnh dev server để
Docker truy cập được; chỉ dùng dev server trong môi trường phát triển kiểm soát.

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

## Hợp đồng API và giao hàng

Backend commit openapi/v1.json trước; sau đó chạy `npm run api:sync`,
`npm run api:generate` và commit bản sao + generated. `npm run api:check` kiểm
drift, `npm run api:clean` xóa bản sinh; không sửa generated bằng tay.
Component chỉ gọi data-access. SSR ánh xạ transfer cache để không gọi API lần hai.

`npm run e2e` chạy qua Traefik với API/hai app đang chạy, kiểm no-JS, axe,
keyboard/focus và sáu viewport. `npm run e2e:ci` dùng API HTTP giả để kiểm repo độc
lập; không chứng minh PostgreSQL. Chrome local, Chromium Playwright trong CI.
`npm run licenses:check`, `npm run deps:audit`, `npm run secrets:scan` là các cổng
dependency. `npm run docker:build` tạo image SSR/nginx non-root;
`npm run docker:smoke` kiểm health, SSR và SPA fallback (cần API thật ở 5080).

Xem docs/mobile-first-design.md, docs/ui-migration.md và bộ docs/huong-dan của repo
docs. UI dùng Spartan brain + helm trong ui và Tailwind 4; chưa dùng Lucide.

Giao diện tuân theo UI-SPEC và hệ thiết kế trong repo BepThayMao-Spec.
Font Vollkorn và Hanken Grotesk tự host, gồm các subset tiếng Việt.
