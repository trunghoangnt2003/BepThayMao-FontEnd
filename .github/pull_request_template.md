## Thay đổi

Mô tả hành vi thay đổi và task/spec liên quan; tiêu đề theo Conventional Commits.

## Kiểm chứng

Dán đầu ra `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
Yêu cầu 0 error, 0 warning, không test bị bỏ qua và coverage đạt ngưỡng.

- [ ] Nếu đổi API: đã sync hợp đồng backend và sinh lại client, không sửa mã sinh bằng tay.
- [ ] Giao diện đã kiểm bàn phím, no-JS ở customer, axe và Hallmark theo UI-SPEC.
- [ ] Không có secret/dữ liệu cá nhân trong commit hoặc log.
- [ ] Hai developer đã review và duyệt.
