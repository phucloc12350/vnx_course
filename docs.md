# Tài liệu Kỹ thuật: AI Chatbot "Cô Minh English"

## 1. Tech Stack

| Thành phần | Công nghệ |
|---|---|
| Framework | Next.js 16 (App Router) |
| AI SDK | Vercel AI SDK v6 (`ai@6`, `@ai-sdk/react@3`) |
| AI Model | Google Gemini 2.5 Flash (qua `@ai-sdk/google`) |
| UI | Ant Design v6 |
| Auth | Cookie-based (`httpOnly`, custom middleware) |
| Storage hiện tại | `localStorage` trên trình duyệt |
| Runtime API | Edge Runtime (Vercel Edge Functions) |

---

## 2. Cấu trúc thư mục

```
app/
├── api/
│   ├── auth/login/route.ts   # Xác thực đăng nhập
│   ├── chat/route.ts         # Streaming AI response
│   └── dictionary/route.ts   # Tra từ điển
├── chat-co-minh/page.tsx     # Trang chat chính
├── login/page.tsx            # Trang đăng nhập
└── layout.tsx

components/
├── ChatWindow.tsx            # Giao diện chat + useChat hook
├── HistoryPanel.tsx          # Panel lịch sử bên phải
├── Sidebar.tsx               # Menu bên trái
└── AppLayout.tsx             # Layout tổng thể

hooks/
└── useChatHistory.ts         # Quản lý conversations (localStorage)

types/
└── chat.ts                   # Type: Conversation, StoredMessage
```

---

## 3. Flow Hoạt Động

### 3.1. Xác thực (Auth Flow)

```
User truy cập bất kỳ route nào
        ↓
middleware.ts kiểm tra cookie "auth-token"
        ↓
  Không có token? ──→ Redirect /login
        ↓
  Có token hợp lệ ("vnx-admin-auth")? ──→ Cho phép truy cập
        ↓
POST /api/auth/login
  - Kiểm tra username/password (hardcode: admin/12345678)
  - Set httpOnly cookie "auth-token" (TTL: 7 ngày)
  - Redirect về trang chủ
```

### 3.2. Flow Chat chính

```
ChatPage (app/chat-co-minh/page.tsx)
    │
    ├── useChatHistory()          ← Đọc conversations từ localStorage
    │       │
    │       └── conversations[]  ← Danh sách cuộc trò chuyện
    │
    ├── HistoryPanel              ← Hiển thị danh sách bên phải
    │       │
    │       └── onSelect(id) → handleSelectConv(id)
    │                               setActiveId(id)
    │                               setSessionKey(id)  ← Remount ChatWindow
    │
    └── ChatWindow (key={sessionKey})
            │
            ├── useChat({ messages: initialMessages })
            │       │
            │       └── initialMessages = storedToMessages(selectedConv.messages)
            │
            ├── User gửi tin nhắn
            │       ↓
            │   sendMessage() → POST /api/chat
            │       body: { messages, level, weakness }
            │
            └── /api/chat/route.ts (Edge Runtime)
                    │
                    ├── streamText(gemini-2.5-flash, systemPrompt, messages.slice(-20))
                    │
                    └── return toUIMessageStreamResponse()
                            ↓
                    ChatWindow nhận stream, hiển thị realtime
                            ↓
                    status: "ready" → onMessagesUpdate(messages)
                            ↓
                    useChatHistory.updateConversation()
                            ↓
                    Lưu vào localStorage
```

### 3.3. Flow Lưu & Tải Lịch Sử

```
Lần đầu gửi tin nhắn trong session mới:
  AI trả lời xong
    → onMessagesUpdate(messages) được gọi
    → savedConvIdRef.current === null
    → createConversation(firstUserMessage)   [tạo entry mới trong localStorage]
    → savedConvIdRef.current = newConv.id    [ref, không trigger re-render]
    → updateConversation(newConv.id, stored) [lưu messages]

Các lần tiếp theo trong cùng session:
    → updateConversation(savedConvIdRef.current, stored) [ghi đè messages]

Click vào lịch sử cũ:
    → handleSelectConv(id)
    → setSessionKey(id)  ← ChatWindow remount với key mới
    → initialMessages = storedToMessages(selectedConv.messages)
    → useChat({ messages: initialMessages })  ← Load lịch sử vào UI
```

### 3.4. Chuyển đổi Format Messages

```
AI SDK UIMessage (useChat)
    ↓  messagesToStored()
StoredMessage (localStorage / DB)
    ↓  storedToMessages()
AI SDK UIMessage (khi load lại)
```

| Field | UIMessage (AI SDK) | StoredMessage (lưu trữ) |
|---|---|---|
| id | `string` | `string` |
| role | `'user' \| 'assistant'` | `'user' \| 'assistant'` |
| content | `string` (deprecated) | `string` |
| parts | `[{ type: 'text', text }]` | — (trích xuất thành `content`) |
| createdAt | `Date` | `string` (ISO) |

---

## 4. Phân Tích Lưu Trữ: localStorage vs. Database

### 4.1. Hiện trạng: localStorage

```
Browser A (máy 1)              Browser B (máy 2)
┌─────────────────┐            ┌─────────────────┐
│  localStorage   │            │  localStorage   │
│  [conv1, conv2] │            │  [conv3, conv4] │   ← Dữ liệu tách biệt!
└─────────────────┘            └─────────────────┘
```

**Ưu điểm:**
- Zero setup, không cần backend/DB
- Không tốn chi phí
- Phù hợp giai đoạn prototype/học tập

**Nhược điểm khi lên Vercel (production):**
- **Mất dữ liệu khi đổi trình duyệt hoặc máy khác** — lịch sử không đồng bộ
- **Mỗi user/browser lưu riêng** — không chia sẻ được
- **Không có backup** — xóa cache/cookies là mất hết
- **Không thể multi-user thật** — mọi người dùng cùng 1 account "admin" đều thấy dữ liệu trong browser của mình
- **Giới hạn dung lượng** — localStorage chỉ ~5MB/domain

### 4.2. Khi Deploy lên Vercel

Vercel deploy Next.js dưới dạng **Serverless Functions** và **Edge Functions**:

```
User Browser
    │
    │  HTTPS
    ↓
Vercel Edge Network (CDN)
    │
    ├── Static files (.js, .css, images) → CDN cache
    │
    ├── /api/chat          → Edge Function (gemini streaming)
    ├── /api/auth/login    → Serverless Function
    └── /api/dictionary    → Serverless Function
```

**Lưu ý quan trọng:** Vercel Functions là **stateless** — không thể lưu dữ liệu trong bộ nhớ server giữa các request. Mọi thứ cần lưu trữ **bắt buộc phải đi ra ngoài** (Database, Redis, S3...).

---

## 5. Kế Hoạch Migration lên Database (Vercel Postgres / Neon)

### 5.1. Database Schema

```sql
-- Bảng conversations: lưu metadata cuộc trò chuyện
CREATE TABLE conversations (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     VARCHAR(50)  NOT NULL DEFAULT 'admin',
  title       VARCHAR(255) NOT NULL DEFAULT 'Cuộc trò chuyện mới',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Bảng messages: lưu từng tin nhắn
CREATE TABLE messages (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID         NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role             VARCHAR(20)  NOT NULL CHECK (role IN ('user', 'assistant')),
  content          TEXT         NOT NULL,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Index để query nhanh
CREATE INDEX idx_messages_conv   ON messages(conversation_id);
CREATE INDEX idx_conv_user_time  ON conversations(user_id, updated_at DESC);
```

### 5.2. API Routes cần thêm khi dùng DB

| Method | Route | Chức năng |
|---|---|---|
| `GET` | `/api/conversations` | Lấy danh sách conversations của user |
| `POST` | `/api/conversations` | Tạo conversation mới |
| `GET` | `/api/conversations/[id]` | Lấy chi tiết + messages của 1 conversation |
| `PUT` | `/api/conversations/[id]` | Cập nhật title / messages |
| `DELETE` | `/api/conversations/[id]` | Xóa conversation |

### 5.3. Lựa chọn Database phù hợp với Vercel

| Option | Chi phí | Độ trễ | Ghi chú |
|---|---|---|---|
| **Vercel Postgres** (Neon) | Free tier: 0.5GB | ~50ms | Tích hợp sẵn trong Vercel dashboard, dễ setup nhất |
| **Neon** (trực tiếp) | Free tier: 0.5GB | ~50ms | Serverless Postgres, tương thích Edge Runtime |
| **Supabase** | Free tier: 500MB | ~100ms | Có sẵn Auth + Realtime, nhiều tính năng hơn |
| **PlanetScale** | Free tier đã bỏ | ~80ms | MySQL, không dùng nữa |
| **Upstash Redis** | Free tier: 10K req/day | ~10ms | Phù hợp cache, không phù hợp lưu messages lâu dài |

**Khuyến nghị: Neon (Vercel Postgres)** — free, serverless, tích hợp 1-click với Vercel.

### 5.4. Setup từng bước (Neon + Vercel)

```
1. Vào Vercel Dashboard → Storage → Create Database → Postgres (Neon)
   → Tự động thêm env vars: POSTGRES_URL, POSTGRES_URL_NON_POOLING, ...

2. Cài package:
   npm install @vercel/postgres
   # hoặc dùng drizzle ORM:
   npm install drizzle-orm @neondatabase/serverless

3. Tạo schema (chạy 1 lần):
   vercel env pull .env.local
   npx tsx scripts/migrate.ts

4. Thay useChatHistory.ts:
   - Bỏ localStorage
   - Thay bằng fetch('/api/conversations')
   - useEffect load conversations khi mount
   - updateConversation → PUT /api/conversations/[id]

5. Deploy: git push → Vercel tự build & deploy
```

### 5.5. Sơ đồ kiến trúc sau khi migrate

```
Browser
  │
  ├── GET /api/conversations      ← Lấy danh sách (thay localStorage.getItem)
  ├── POST /api/conversations     ← Tạo mới (thay createConversation)
  ├── PUT /api/conversations/[id] ← Cập nhật (thay updateConversation)
  ├── DELETE /api/conversations/[id] ← Xóa (thay deleteConversation)
  │
  └── POST /api/chat              ← Streaming AI (không đổi)

Vercel Serverless Functions
  │
  └── @vercel/postgres (Neon)
        │
        └── PostgreSQL Database
              ├── conversations table
              └── messages table
```

---

## 6. Lưu Ý Bảo Mật Khi Lên Production

### 6.1. Auth hiện tại (cần cải thiện)
- Password hardcode trong code (`admin/12345678`) → **Phải chuyển sang env variable**
- Token là string cố định `"vnx-admin-auth"` → **Nên dùng JWT hoặc NextAuth.js**
- Không có rate limiting cho `/api/auth/login` → **Dễ bị brute force**

```bash
# .env.local (KHÔNG commit lên git)
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_secure_password
JWT_SECRET=your_random_secret_key
```

### 6.2. API Key
```bash
# .env.local
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```
Trên Vercel: Settings → Environment Variables → thêm các key trên.

### 6.3. .gitignore (đã có)
```
.env.local     ← API keys, passwords
.next/         ← Build output
node_modules/  ← Dependencies
```

---

## 7. Bug Đã Fix

### Bug: Click lịch sử chat → panel trống

**Nguyên nhân:** `useChat` trong `@ai-sdk/react@3.x` nhận option tên là `messages` (không phải `initialMessages`). Code cũ truyền `{ initialMessages: [...] }` nên SDK bỏ qua, chat luôn khởi động với mảng rỗng.

**Fix trong `components/ChatWindow.tsx`:**
```tsx
// TRƯỚC (sai)
const chatOptions = initialMessages?.length ? { initialMessages } : {};

// SAU (đúng)
const chatOptions = initialMessages?.length ? { messages: initialMessages } : {};
```

**Nguyên nhân kỹ thuật:** Trong source của `@ai-sdk/react`:
```javascript
var Chat = class extends AbstractChat {
  constructor({ messages, ...init }) {   // ← nhận "messages", không phải "initialMessages"
    const state = new ReactChatState(messages);
    ...
  }
};
```
