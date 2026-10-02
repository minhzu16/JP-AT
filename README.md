# Job Portal & Application Tracker (CareerVanguard)

Hệ thống Cổng Thông tin Tuyển dụng & Theo dõi Ứng viên (ATS) hiện đại, xây dựng theo kiến trúc Monorepo đạt chuẩn bảo mật và tuân thủ Luật Bảo vệ dữ liệu cá nhân Việt Nam (91/2025/QH15) cùng chuẩn mực đạo đức EU AI Act.

---

## 1. Kiến trúc & Công nghệ

- **Monorepo**: pnpm workspaces + Turborepo
- **Backend API (`apps/api`)**: NestJS 10, REST, Passport JWT (Access + Refresh Token), RBAC Guards, Swagger OpenAPI (`/api/docs`), RFC 7807 problem+json error formatting.
- **Frontend Web (`apps/web`)**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide icons, Dark/Light Mode.
- **Database & ORM (`packages/db`)**: PostgreSQL 16 + Prisma ORM + Seeds dữ liệu thực tế.
- **Shared Module (`packages/shared`)**: Zod Schemas, Application State Machine validator, Deterministic Skill Matching & PII Anonymization.
- **Infra (`infra/`)**: Docker Compose cho PostgreSQL (cổng 5433), Redis (cổng 6381), Mailpit (cổng 8025/1025).

---

## 2. Các Ràng buộc Nghiệp vụ Cốt lõi Đã Thực thi & Kiểm thử

1. **Chống nộp đơn trùng lặp (Requirement #1)**:
   - Ràng buộc tầng CSDL: `@@unique([jobId, candidateId])`.
   - Bắt lỗi `P2002` của Prisma và trả về mã lỗi HTTP 409 Conflict với code `ALREADY_APPLIED`.
   - UI chuyển sang trạng thái "Đã nộp đơn" và vô hiệu hóa nút nộp.
2. **Phân quyền dữ liệu Recruiter nhiều lớp (Requirement #2 - IDOR Prevention)**:
   - Recruiter **chỉ xem và thao tác trên đơn thuộc các tin do công ty mình đăng**.
   - Phòng thủ 3 lớp: Guard kiểm tra quyền -> Scoped Query qua CompanyMember -> Trả về `404 Not Found` (thay vì 403) khi truy cập đơn của công ty khác nhằm ngăn chặn dò quét ID.
3. **Application State Machine (Requirement #3)**:
   - Pipeline trạng thái: `APPLIED` -> `SCREENING` -> `INTERVIEW` -> `OFFER` -> `HIRED` / `REJECTED` / `WITHDRAWN`.
   - Chặn các bước nhảy trạng thái phi logic (ví dụ `APPLIED` nhảy trực tiếp lên `HIRED` trả về `422 Unprocessable Entity`).
   - Mọi thay đổi trạng thái đều ghi nhận vào bảng `application_status_history` và `audit_logs`.
4. **Quản lý CV & Tài liệu (Requirement #4)**:
   - Presigned upload, kiểm tra magic bytes & mime type, tính băm SHA-256, kiểm tra an toàn ClamAV (`CLEAN`).
   - Tải CV an toàn với `Content-Disposition: attachment` và ghi log kiểm toán `RESUME_DOWNLOADED`.
5. **Module So khớp Kỹ năng & AI Feedback Khách quan (Module 12)**:
   - Thuật toán tính điểm tất định: `score = 100 * sum(weight_k * match_k) / sum(weight_k)`.
   - Gắn cờ cảnh báo nếu thiếu kỹ năng bắt buộc nhưng **tuyệt đối không tự động loại ứng viên** (Human-in-the-loop).
   - Tự động làm mờ (redact) PII (tên, số điện thoại, ngày sinh, giới tính) trước khi xử lý AI.
   - Gợi ý nâng cấp CV theo công thức STAR và chỉ số định lượng.

---

## 3. Tài khoản Demo có sẵn (1-Click Switcher trên UI)

| Vai trò | Email | Mật khẩu | Mô tả |
|---|---|---|---|
| **Ứng viên 1** | `candidate1@gmail.com` | `Password123!@#` | Trần Minh Quân (Senior Full-stack Engineer, 5 năm KN) |
| **Ứng viên 2** | `candidate2@gmail.com` | `Password123!@#` | Lê Thị Thu Hà (Frontend React / Tailwind Dev) |
| **Nhà tuyển dụng VNG** | `recruiter.vng@gmail.com` | `Password123!@#` | Tuyển dụng VNG Corporation |
| **Nhà tuyển dụng FPT** | `recruiter.fpt@gmail.com` | `Password123!@#` | Tuyển dụng FPT Software |
| **Quản trị viên** | `admin@jobportal.vn` | `Password123!@#` | Platform Admin & Quản lý Nhật ký Kiểm toán |

---

## 4. Hướng dẫn Khởi chạy Dự án

```bash
# 1. Khởi động PostgreSQL, Redis, Mailpit qua Docker
rtk docker compose -f infra/docker-compose.yml up -d

# 2. Cài đặt dependencies toàn monorepo
rtk pnpm install
rtk pnpm approve-builds --all

# 3. Migrate & Seed CSDL PostgreSQL
rtk pnpm db:push
rtk pnpm db:seed

# 4. Chạy automated tests
rtk pnpm --filter @jobportal/shared test
rtk pnpm --filter @jobportal/api test

# 5. Khởi chạy Backend API (Cổng 3001)
rtk pnpm --filter @jobportal/api start

# 6. Khởi chạy Frontend Web (Cổng 3000)
rtk pnpm --filter @jobportal/web start
```

Truy cập:
- **Web App**: http://localhost:3000
- **REST API Swagger**: http://localhost:3001/api/docs
- **Health check**: http://localhost:3001/health
- **Mailpit Web UI**: http://localhost:8025
