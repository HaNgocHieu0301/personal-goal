# Personal Goal OS (Hệ điều hành Mục tiêu Cá nhân)

## IMPORTANT:
- Luôn luôn cập nhật những thay đổi vào docs

## Mô tả chung

Personal Goal OS là một nền tảng quản trị mục tiêu cá nhân giúp người dùng thu hẹp khoảng cách giữa **"Lập kế hoạch"** và **"Thực hiện"**. Hệ thống tập trung vào việc quản lý sự tập trung (Focus Management) hơn là chỉ quản lý công việc (Task Management).

## 🚀 Tính năng cốt lõi

- **Architect Deck:** Quản lý mục tiêu theo cấu trúc cây (Recursive Tree). Hỗ trợ phân cấp vô hạn, trọng số công việc, và inline editing cực nhanh.
- **Warrior Mode:** Dashboard tối giản chỉ hiển thị tối đa 3 việc quan trọng nhất (The Big 3). Tích hợp Focus Timer để duy trì sự tập trung.
- **Discipline Engine:** Cơ chế kỷ luật Beast Mode với Quỹ Tự Phạt (Self-Punishment Fund).
- **Momentum Score:** Theo dõi chuỗi (Streak) năng suất để tạo áp lực duy trì kỷ luật.

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js (App Router)
- **State Management:** TanStack Query (Server State) & Zustand (UI State)
- **Styling:** Tailwind CSS + Shadcn/UI
- **Icons:** Lucide React

### Backend
- **Language:** Golang
- **Framework:** Gin
- **Database:** PostgreSQL 16 (GORM)
- **Infrastructure:** Docker & Docker Compose

## 🏁 Bắt đầu (Local Setup)

### 1. Yêu cầu hệ thống
- Docker & Docker Compose
- Node.js 18+

### 2. Chạy Backend & Database
```bash
docker compose up -d
```
Backend sẽ khởi chạy tại `http://localhost:8080`. Database Postgres và Redis cũng sẽ được setup tự động.

### 3. Chạy Frontend
```bash
cd web
npm install
npm run dev
```
Truy cập ứng dụng tại `http://localhost:3000`.

## 📂 Cấu trúc thư mục
- `/backend`: Mã nguồn Golang API & Dockerfile.
- `/web`: Mã nguồn Next.js Frontend.
- `/docs`: Tài liệu thiết kế, kiến trúc (Architecture) và Roadmap.

---
*Created with ❤️ by Antigravity*
