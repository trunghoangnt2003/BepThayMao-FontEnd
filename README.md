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

## Hợp đồng API

Backend là nguồn của hợp đồng: thay đổi API thì backend commit `openapi/v1.json` trước, rồi ở đây chạy

```sh
npm run api:sync      # chép ../backend/openapi/v1.json nguyên byte sang openapi/v1.json
npm run api:generate  # Orval sinh projects/api-client/src/generated
```

và commit cả `openapi/v1.json` lẫn `generated/` trong cùng đợt. Không sửa tay `generated/`. `npm run api:check` (pre-push và CI) báo lệch khi client sinh không khớp; trong workspace đủ ba repo nó còn so bản sao với backend. Chỉ `features/*/data-access` được import `@bepthaymao/api-client/endpoints`; trang/component chỉ dùng model.

## Chạy cục bộ và kiểm

- `npm run start:customer -- --host 0.0.0.0` (4200, SSR) và `npm run start:admin -- --host 0.0.0.0` (4201, `/admin/`), qua Traefik của backend tại `http://127.0.0.1:8080`.
- `npm run e2e` qua Traefik (cần backend `dev:up` + `dev:api`); `npm run e2e:ci` không cần backend (mock API).
- `npm run docker:build && npm run docker:smoke`; `npm run licenses:check`, `npm run deps:audit`.
- Máy không có Google Chrome: `npx playwright install chromium` rồi đặt `CI=true` để Playwright dùng Chromium kèm theo.
