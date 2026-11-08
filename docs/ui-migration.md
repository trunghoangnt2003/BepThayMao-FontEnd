# Chuyển đổi nền tảng UI sang Spartan

## Audit và phạm vi

Ngày kiểm tra: 2026-11-09. Angular 22.2.5, CLI 22.2.6, TypeScript strict 6.0.3. Hai app: customer SSR và admin SPA; các thư viện api-client, core, ui đã tách biệt. Không có Material, PrimeNG, NG-ZORRO hoặc framework component khác.

UI hiện hữu gồm shell customer, shell admin, navigation Cơ sở và hai trang 404 lazy-load. Chưa có page sản phẩm, cart, checkout, auth hoặc danh sách cơ sở thực tế. Vì vậy không tạo màn hình giả để báo migration đủ chức năng.

Trước chuyển đổi: CSS Garden dùng chung, hai biến thể CTA `.btn`, layout shell trùng lặp. Core interceptor, SEO, routing, title strategy và route focus giữ nguyên trách nhiệm.

## Kế hoạch và tích hợp

1. Audit package, template, route và CSS trước khi đổi.
2. Giữ Angular; Spartan brain/CLI 1.9.0 hỗ trợ Angular 21–22. Dùng Tailwind 4.3.5 qua PostCSS, CDK 22.2.5; xác minh MIT cho dependency trực tiếp mới.
3. Theo hướng dẫn cài thủ công chính thức và CLI `ng g @spartan-ng/cli:ui button --interactive=false`; cấu hình `components.json` trỏ vào thư viện ui. Không gọi init ghi đè theme Garden.
4. Chuyển CTA sang HlmButton, shell sang utility Tailwind. Xóa hệ `.btn` cũ sau khi hết người dùng.
5. Chạy cổng kiểm chứng và ghi lỗi còn tồn tại.

Spartan button được sinh chính thức rồi tùy biến: class host dùng computed/hlm thay bộ MutationObserver để Angular sở hữu class; tách kiểu token để không có vòng import. Brain vẫn xử lý hành vi disabled/click. Unit test kiểm chứng native semantics, class tĩnh, variant động và disabled.

## Kiến trúc component và token

| Nhóm                  | Vị trí và quy tắc                                                          |
| --------------------- | -------------------------------------------------------------------------- |
| Primitive             | `projects/ui/src/lib/helm`, xuất primitive dùng thực tế qua public-api     |
| Layout/navigation     | Utility Tailwind dùng token; navigation native có landmark và active state |
| Form/feedback         | Sinh Spartan input/select/dialog khi feature cần; không tạo API giả        |
| Product/cart/checkout | Component feature, nhận dữ liệu qua inputs, không gọi API trong primitive  |
| Core/data-access      | Không thay đổi để phục vụ UI migration                                     |

Token Garden giữ nguyên màu, font, cỡ chữ, weight, spacing, radius, border, motion và kích thước control. `spartan-theme.css` ánh xạ background/card/popover/primary/secondary/muted/destructive/input/ring và shadow, disabled opacity; breakpoint Tailwind 40/48/60/80rem. Focus và reduced-motion giữ ở CSS dùng chung. Font Việt tiếp tục tự host.

## Dependency và giới hạn

Không có framework UI cũ cần gỡ; CSS button cũ đã được loại bỏ. Font hiện hữu OFL được giữ nguyên, không phải dependency mới.

Lucide Angular là ISC và bản trực tiếp hiện khai báo Angular tối đa 21; chưa được phép ép peer hoặc mặc định coi ISC là MIT. Ngoại lệ đang chờ chủ dự án trả lời; adapter Lucide của ng-icons cũng ISC.

Audit production hiện 0 lỗ hổng. Cây dev có cảnh báo gồm CLI Spartan kéo zod 3 (high); chưa ép lên major 4 vì không bảo đảm tương thích CLI. Lighthouse và workflow thương mại chưa có màn hình thực tế để xác nhận.

## Nguồn chính thức

- https://www.spartan.ng/documentation/installation
- https://www.spartan.ng/documentation/version-support
- https://tailwindcss.com/docs/installation/framework-guides/angular
- Angular CLI MCP get_best_practices đã được gọi trước khi sửa Angular.

## Kết quả kiểm chứng

| Kiểm tra               | Kết quả                                                                                |
| ---------------------- | -------------------------------------------------------------------------------------- |
| `npm run lint`         | Exit 0, 0 error/0 warning                                                              |
| `npm run typecheck`    | Exit 0, strict Angular/TS và E2E, không có vòng dependency                             |
| `npm test`             | 29 test qua: customer 7, admin 7, core 12, ui 3; không skip                            |
| `npm run test:scripts` | 6 test qua, gồm quy tắc tên nhánh develop                                              |
| `npm run build`        | Hai app qua, 0 warning; font Việt tự host được xác minh                                |
| `npm run smoke:ssr`    | Health 200, HTML 404 tiếng Việt/SEO, Host lạ 400                                       |
| E2E                    | Bàn phím, focus, SSR không JS, title, axe và 320/768/1440px; xem Playwright report     |
| Hallmark shared styles | 0 FAIL, 0 WARN; rà toàn bộ component riêng cho false positive vì không thấy global CSS |
| Lighthouse             | Chưa đo; không tuyên bố đạt target trên page 404 có noindex                            |

Ảnh Playwright mobile customer và desktop admin đã được kiểm tra trực quan: font tiếng Việt rõ, CTA đủ kích thước, nền và typography Garden nhất quán. Không có page sản phẩm thực để đánh giá ảnh món ăn hoặc workflow mua hàng. Kiểm tra pageerror được thực hiện trong hai test axe; HTTP 404 trên trang 404 vẫn là hành vi chủ đích.

## Vấn đề còn lại

- Chờ chấp thuận ngoại lệ ISC cho Lucide trước khi cài adapter icon; migration chưa hoàn tất yêu cầu icon.
- CLI dev kéo zod 3 có advisory high; không dùng trong production. Cần bản CLI vá tương thích, không ép major hoặc chạy audit fix --force.
- Chưa đo Lighthouse, chưa có workflow sản phẩm/cart/checkout/auth để chạy. Những nhóm này phải dùng Spartan khi được triển khai theo roadmap.
- Cảnh báo môi trường Playwright NO_COLOR/FORCE_COLOR không phải Angular build warning; sẽ cần chuẩn hóa cấu hình màu của runner.
