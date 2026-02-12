# CS Hub - Tài Liệu Bách Khoa

Hệ thống tài liệu học tập Computer Science và môn đại cương cho sinh viên Trường Đại học Bách Khoa TP.HCM.

## 🚀 Tính năng chính

- **Danh sách môn học đầy đủ**: Computer Science + Môn đại cương
- **Quản lý tài liệu**: Upload, tải xuống, phân loại theo chương/bài
- **Hệ thống nhắn tin**: Chat real-time giữa sinh viên và admin
- **Sidebar thông minh**: Hover để mở rộng, gọn gàng khi thu gọn
- **Quản trị viên**: Quản lý ngườ dùng, môn học, tài liệu
- **Responsive**: Hoạt động tốt trên desktop, tablet, mobile

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **State Management**: Zustand
- **Icons**: Lucide React

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Real-time**: Socket.io
- **Authentication**: JWT

## 📁 Cấu trúc thư mục

```
cs-hub/
├── src/                          # Frontend Next.js
│   ├── app/                      # App Router pages
│   │   ├── login/               # Trang đăng nhập
│   │   ├── register/            # Trang đăng ký
│   │   ├── subjects/            # Danh sách môn học
│   │   ├── messages/            # Hệ thống chat
│   │   ├── admin/               # Trang quản trị
│   │   └── profile/             # Trang cá nhân
│   ├── components/              # React components
│   │   ├── layout/             # Layout components (Header, Sidebar)
│   │   └── ui/                 # Shadcn/ui components
│   ├── lib/                    # Utilities, stores
│   ├── constants/              # Constants (subjects data)
│   └── types/                  # TypeScript types
├── backend/                     # Backend API
│   ├── src/
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Authentication middleware
│   │   └── utils/             # Utilities (prisma client)
│   └── prisma/
│       └── schema.prisma      # Database schema
└── README.md
```

## 🚀 Cài đặt và chạy

### Yêu cầu
- Node.js 18+
- PostgreSQL 14+

### 1. Clone và cài đặt dependencies

```bash
# Frontend
cd cs-hub
npm install

# Backend
cd backend
npm install
```

### 2. Cấu hình môi trường

```bash
# Backend
cd backend
cp .env.example .env
# Chỉnh sửa DATABASE_URL trong file .env
```

### 3. Setup Database

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Chạy ứng dụng

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd cs-hub
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Thông tin user hiện tại

### Subjects
- `GET /api/subjects` - Danh sách môn học
- `GET /api/subjects/:slug` - Chi tiết môn học
- `POST /api/subjects` - Tạo môn học (admin)

### Documents
- `GET /api/documents` - Danh sách tài liệu
- `GET /api/documents/:id` - Chi tiết tài liệu
- `POST /api/documents` - Upload tài liệu
- `POST /api/documents/:id/download` - Tải tài liệu

### Messages
- `GET /api/messages/conversations` - Danh sách conversations
- `GET /api/messages/conversations/:id/messages` - Tin nhắn trong conversation
- `POST /api/messages/conversations` - Tạo conversation mới
- `POST /api/messages/conversations/:id/messages` - Gửi tin nhắn

### Users
- `GET /api/users` - Danh sách users (admin)
- `GET /api/users/:id` - Thông tin user
- `PATCH /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user (admin)

## 🎨 Tính năng UI/UX

### Sidebar Animation
- Thu gọn: 64px (chỉ hiện icon)
- Hover: Mở rộng 256px với animation mượt mà
- Tooltip khi thu gọn

### Homepage
- Hero section với gradient background
- Stats counter
- Subject grid với icon và màu sắc
- Scroll reveal animation

### Chat System
- Danh sách conversations bên trái
- Chat window bên phải
- Real-time messaging (Socket.io)
- File attachment support

### Admin Dashboard
- Stats cards với trend indicators
- Tabs: Users, Documents, Support
- CRUD operations
- Data tables

## 🔐 Authentication

- JWT tokens (7 days expiration)
- Password hashing (bcrypt)
- Role-based access control (RBAC)
- Protected routes middleware

## 🌐 Socket.io Events

```javascript
// Client
socket.emit('join-conversation', conversationId);
socket.emit('send-message', { conversationId, content, senderId });

// Server
socket.on('new-message', (data) => {
  // Handle new message
});
```

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🔮 Future Roadmap

- [ ] Mobile app (React Native)
- [ ] Offline mode (PWA)
- [ ] AI chatbot assistant
- [ ] Collaborative notes
- [ ] Video lectures integration
- [ ] Gamification (points, badges)

## 👨‍💻 Tác giả

Built with ❤️ for HCMUT students

## 📄 License

MIT License
