> ⚠️ **Tài liệu do AI tạo, chưa được đo hay kiểm chứng.** Các số liệu, điểm số và benchmark dưới đây không có test
> hay phép đo nào chứng minh. Đánh giá hiện hành: `../scorecard_and_upgrade_plan.md` (thư mục gốc self_project).

# KẾ HOẠCH TRIỂN KHAI TỔNG THỂ (MASTER IMPLEMENTATION PLAN) - PJ5
## Nâng Cấp Hệ Thống Cổng Thông Tin Tuyển Dụng & Theo Dõi Ứng Viên (Job Portal & Application Tracker - CareerVanguard) Theo Chuẩn Mực 12 Agent / Skill

**Kiến trúc sư trưởng:** Gemini 4 Argon (Chế độ Tư duy Cao)  
**Kỹ sư thực thi:** Antigravity  
**Tech Stack:** NestJS 10 · Next.js 15 (App Router) · PostgreSQL 16 · Prisma ORM · Redis 7 · Mailpit · Docker Compose · TypeScript 5 · Turborepo

---

### 1. Đánh Giá Hiện Trạng & Yêu Cầu Pháp Lý - Kỹ Thuật Bắt Buộc

Hệ thống **PJ5 (CareerVanguard)** là nền tảng tuyển dụng và quản lý hồ sơ ứng viên (Applicant Tracking System - ATS) đa đối tượng (Ứng viên, Nhà tuyển dụng đa công ty, Quản trị viên nền tảng). Khác với các hệ thống web thông thường, PJ5 chịu sự điều chỉnh trực tiếp bởi các quy định pháp luật và chuẩn mực đạo đức công nghệ khắt khe:

1. **Tuân thủ Luật Bảo vệ Dữ liệu Cá nhân Việt Nam (Số 91/2025/QH15):**
   - Được Quốc hội khóa XV thông qua ngày 26/06/2025 và chính thức có hiệu lực thi hành từ ngày **01/01/2026** (kế thừa, chuẩn hóa và nâng tầm từ **Nghị định 13/2023/NĐ-CP**).
   - Hệ thống bắt buộc tôn trọng quyền của chủ thể dữ liệu: Quyền được biết, quyền đồng ý, quyền rút lại sự đồng ý (quy trình rút hồ sơ `WITHDRAWN`), nghĩa vụ khử nhận dạng dữ liệu cá nhân (PII Anonymization) trước khi phân tích xử lý, và lưu vết kiểm toán đầy đủ mọi thao tác tiếp cận dữ liệu nhạy cảm (như tải CV qua log `RESUME_DOWNLOADED`).
2. **Tuân thủ Đạo luật Trí tuệ Nhân tạo Liên minh Châu Âu (EU AI Act - Regulation (EU) 2024/1689):**
   - Hệ thống AI trong tuyển dụng và tuyển chọn nhân sự được phân loại vào nhóm **Hệ thống AI có Rủi ro Cao (High-Risk AI System theo Annex III, Point 4)**.
   - **Bắt buộc cơ chế Giám sát của Con người (Human-in-the-loop - Article 14):** Nghiêm cấm hoàn toàn cơ chế tự động từ chối/loại bỏ ứng viên tự động (chống hiện tượng *automation bias*). Mọi thuật toán so khớp kỹ năng và gợi ý AI chỉ mang tính tham vấn (**`advisoryOnly: true`**); quyết định chuyển giai đoạn tuyển dụng bắt buộc phải do nhân sự (Recruiter/Hiring Manager) phê duyệt.
   - **Giảm thiểu Thiên vị Thuật toán (Bias Mitigation - Article 10):** Tự động che mờ (masking) các thông tin nhận diện nhân khẩu học nhạy cảm (Họ tên, SĐT, Email, Ngày sinh, Tuổi, Giới tính, Tình trạng hôn nhân) trước khi đưa văn bản vào xử lý gợi ý.
3. **Phòng thủ Đa tầng An toàn Thông tin & Chống Gian lận (Security & Anti-IDOR):**
   - Nhà tuyển dụng của Công ty A tuyệt đối không được tiếp cận hồ sơ ứng tuyển của Công ty B. Khi cố tình truy cập sai thẩm quyền, API trả về **HTTP 404 Not Found** (thay vì 403) nhằm ngăn chặn kỹ thuật dò quét định danh (ID Enumeration).
   - Ràng buộc CSDL chống nộp đơn trùng lặp (`@@unique([jobId, candidateId])`) và quản lý luồng trạng thái ứng viên thông qua Finite State Machine (FSM).

---

### 2. Ma Trận Ứng Dụng 12 Agent / Skill Chuẩn Mực Vào PJ5

| STT | Tên Agent / Skill | Trọng tâm Áp dụng trong PJ5 | Mục tiêu Kỹ thuật Cụ thể |
|:---:|---|---|---|
| **01** | **Domain Modeling** | Bounded Contexts: Identity & Auth, Job Catalog, Application Lifecycle, ATS Kanban, AI Assessment | Lập mô hình thực thể DDD chặt chẽ giữa User, Company, Job, Application, ApplicationStatusHistory, ResumeDocument, AuditLog. |
| **02** | **Security & Hardening** | Phòng thủ IDOR 3 lớp, Tuân thủ Luật 91/2025/QH15 & EU AI Act | Trả về 404 cho truy cập chéo tenant; làm mờ PII (`anonymizeCandidateProfile`); bảo vệ luồng upload CV bằng kiểm tra magic bytes, MIME type, băm SHA-256 và quét ClamAV (`CLEAN`). |
| **03** | **Concurrency Control** | Unique Constraints, Idempotent Operations | Ngăn chặn nộp đơn kép (`409 ALREADY_APPLIED`); xử lý idempotent cho lưu tin tuyển dụng (`PUT` / `DELETE` trên `saved_jobs`). |
| **04** | **Performance & Latency** | Tối ưu hóa Database Queries, Caching Redis | Chỉ mục kép trên các khóa ngoại tuyển dụng `[jobId, candidateId]`, `[companyId, status]`; Redis lưu trữ phiên đăng nhập và rate limit. |
| **05** | **Node Optimization** | NestJS 10 Backend, Module Tách biệt, RFC 7807 Errors | Xử lý lỗi theo chuẩn `application/problem+json` qua `HttpExceptionFilter`; quản lý vòng đời ứng dụng an toàn và dọn dẹp kết nối bất đồng bộ. |
| **06** | **UI/UX Pro Max** | Next.js 15, Tailwind CSS, ATS Kanban Board, 1-Click Switcher | Bảng Kanban tuyển dụng kéo thả trực quan theo từng trạng thái; bộ chuyển đổi tài khoản demo 1 chạm (Candidate, Recruiter, Admin); Dark/Light mode; WCAG AA. |
| **07** | **Karpathy Guidelines** | Thuật toán Tính điểm Tất định (Deterministic Matching) | Triệt tiêu hộp đen AI; tính điểm minh bạch theo công thức: $\text{score} = 100 \times \frac{\sum w_k \cdot m_k}{\sum w_k}$; giải trình rõ ràng các kỹ năng còn thiếu. |
| **08** | **Verification & Observability** | Kiểm toán Toàn diện (Audit Trails), Health Probes | Bảng `audit_logs` ghi nhận vết mọi hành động nhạy cảm: `STATUS_CHANGED`, `RESUME_UPLOADED`, `RESUME_DOWNLOADED`, `JOB_APPLIED`. |
| **09** | **Resilience & Circuit Breaker** | Application State Machine Enforcer | Ngăn chặn các bước nhảy trạng thái phi logic (ví dụ `APPLIED` nhảy cóc lên `HIRED` trả về `422 Unprocessable Entity`); cơ chế xử lý lỗi graceful. |
| **10** | **Documentation & OpenAPI** | Swagger UI (`/api/docs`), Data Flow Docs, AGENTS.md | Đồng bộ hóa toàn bộ hợp đồng API giữa `packages/shared` (Zod schemas) và DTO của NestJS. |
| **11** | **CI/CD & Deployment** | Docker Compose Infrastructure, Multi-stage Build | Cấu hình hạ tầng containerized cho PostgreSQL 16 (cổng 5433), Redis (cổng 6381), Mailpit (cổng 8025/1025). |
| **12** | **Code Quality & Clean Arch** | Turborepo Monorepo, Strict TypeScript, Zero-Warning | Phân tách module độc lập: `apps/api`, `apps/web`, `packages/db`, `packages/shared`; toàn bộ test suites đạt 100% tỷ lệ pass. |

---

### 3. Kế Hoạch Triển Khai Chi Tiết Từng Bước (Phased Master Plan)

#### Giai đoạn 1: Chuẩn Hóa Quản Lý Trạng Thái Tuyển Dụng (Application State Machine)
- **Thiết kế Máy Trạng thái Hữu hạn (FSM):**
  - Chuẩn hóa luồng:
    $$\text{APPLIED} \longrightarrow \text{SCREENING} \longrightarrow \text{INTERVIEW} \longrightarrow \text{OFFER} \longrightarrow \text{HIRED}$$
    với các nhánh rẽ hợp lệ: `REJECTED` (bị từ chối ở bất kỳ vòng nào) và `WITHDRAWN` (ứng viên chủ động rút đơn).
  - Phân quyền thao tác theo vai trò:
    - Ứng viên (`CANDIDATE`): Chỉ được phép chuyển sang trạng thái `WITHDRAWN`.
    - Nhà tuyển dụng (`RECRUITER`): Không được phép thay mặt ứng viên rút đơn; chỉ chuyển đổi giữa các vòng tuyển dụng nội bộ.
  - Xử lý vi phạm: Mọi bước nhảy trạng thái trái phép bị chặn đứng ở tầng validation và trả về `HTTP 422 Unprocessable Entity` kèm thông điệp giải thích rõ ràng.

#### Giai đoạn 2: Thuật Toán So Khớp Kỹ Năng Tất Định & Khử Nhận Dạng PII
- **Thuật toán Khử Nhận Dạng (PII Anonymization):**
  - Tích hợp hàm `anonymizeCandidateProfile(rawText)` làm sạch nội dung CV trước khi chuyển qua module AI hoặc hiển thị ở vòng chấm sơ bộ mù (Blind Screening):
    - Thay thế Email ➔ `[EMAIL_REDACTED]`
    - Thay thế SĐT (chuẩn Việt Nam và quốc tế) ➔ `[PHONE_REDACTED]`
    - Thay thế Ngày sinh/Tuổi ➔ `[DOB_REDACTED]`, `[AGE_REDACTED]`
    - Thay thế Giới tính & Tình trạng hôn nhân ➔ `[GENDER_REDACTED]`, `[MARITAL_STATUS_REDACTED]`
- **Thuật toán So Khớp Tất Định (Deterministic Skill Matching):**
  - Chuẩn hóa tên kỹ năng qua từ điển đồng nghĩa `SKILL_SYNONYMS` (JS/ECMAScript, TS/TypeScript, React/ReactJS, Node.js, v.v.).
  - Tính điểm trọng số minh bạch: Phân biệt rõ kỹ năng bắt buộc (`isRequired: true`) và kỹ năng tùy chọn.
  - Gắn cờ `hasAllRequired: false` nếu thiếu kỹ năng bắt buộc, nhưng **tuyệt đối không tự động loại ứng viên** (bảo đảm tuân thủ Điều 14 EU AI Act).

#### Giai đoạn 3: Phòng Thủ Đa Tầng CSDL & Chống Lỗ Hổng IDOR
- **Chống Nộp Đơn Trùng Lặp (Duplicate Application Prevention):**
  - Thiết lập chỉ mục duy nhất: `@@unique([jobId, candidateId])` tại bảng `applications`.
  - Khối xử lý ngoại lệ bắt lỗi `P2002` của Prisma và chuyển đổi thành HTTP `409 Conflict` với mã lỗi nghiệp vụ `ALREADY_APPLIED`.
- **Phòng Thủ Chống Rò Rỉ Dữ Liệu Đa Doanh Nghiệp (Multi-tenant IDOR Defense):**
  - Luôn truy vấn thông qua bảng trung gian thành viên công ty `CompanyMember`:
    ```typescript
    const membership = await this.prisma.companyMember.findFirst({
      where: { userId: recruiterId, companyId: job.companyId }
    });
    if (!membership) throw new NotFoundException('Application not found');
    ```
  - Trả về mã lỗi **404 Not Found** thay vì 403 Forbidden để ngăn chặn kẻ tấn công suy đoán sự tồn tại của mã hồ sơ ứng viên thuộc doanh nghiệp khác.

#### Giai đoạn 4: Trải Nghiệm Frontend Tuyển Dụng Chuyên Nghiệp (Next.js 15 App Router)
- **Bảng Điều Khiển ATS Kanban Tương Tác:**
  - Thiết kế giao diện kéo thả mượt mà theo 5 cột trạng thái: Nộp đơn, Sơ tuyển, Phỏng vấn, Đề nghị việc làm, Đã tuyển.
  - Drawer chi tiết ứng viên tích hợp điểm số kỹ năng trực quan, hiển thị chi tiết các kỹ năng đạt và chưa đạt, cùng gợi ý phỏng vấn theo phương pháp STAR.
- **Bộ Chuyển Đổi Tài Khoản Demo 1-Chạm:**
  - Header tích hợp sẵn bộ chuyển đổi tức thì giữa 5 tài khoản thử nghiệm thực tế: Ứng viên Senior Full-stack, Ứng viên Frontend, Nhà tuyển dụng VNG, Nhà tuyển dụng FPT, và Quản trị viên hệ thống.

---

### 4. Tiêu Chí Nghiệm Thu Định Lượng (Acceptance Criteria)

1. **Tuân thủ Luật Dữ liệu Cá nhân & EU AI Act:** 100% tài liệu CV được làm mờ PII trước khi đưa vào phân tích; 0 trường hợp ứng viên bị tự động loại bởi thuật toán (toàn bộ kết quả đều mang cờ `advisoryOnly: true`).
2. **Ngăn chặn Xung đột Đồng thời & IDOR:** 100% nộp đơn trùng lặp bị từ chối với HTTP 409; 100% nỗ lực truy cập hồ sơ chéo công ty trả về HTTP 404.
3. **Toàn vẹn Máy Trạng thái:** Chặn 100% các bước nhảy trạng thái sai quy tắc với mã lỗi HTTP 422.
4. **Độ Tin cậy Kỹ thuật:** `pnpm -r build` hoàn thành không lỗi; 100% bài test unit, integration và e2e vượt qua thành công (14/14 tests pass).
