# 👩‍🏫 Cô Minh English - AI Chatbot

Chào mừng bạn đến với dự án **"Cô Minh English"**! Đây là một ứng dụng AI Chatbot được xây dựng theo bài tập 1, đóng vai một giáo viên tiếng Anh có phong cách giảng dạy vô cùng vui vẻ, hơi "nhây" nhưng lại rất nhiệt tình trong việc sửa lỗi và khuyến khích học viên. 

Dự án được ứng dụng **Vercel AI SDK mới nhất (v6)** kết hợp cùng sức mạnh của **Google Gemini 2.5 Flash** để mang lại tốc độ phản hồi siêu nhanh dưới dạng stream theo thời gian thực.

---

## 🌟 Chức Năng Nổi Bật (Features)

- **AI Persona Sống Động:** Chatbot đóng vai "Cô Minh", hỗ trợ song ngữ (Anh - Việt), phát hiện lỗi sai hệ thống thay vì chỉ dịch thuật.
- **Real-time Streaming:** Hiển thị tin nhắn dạng dòng chảy (stream) theo thời gian thực tương tự như ChatGPT nhờ Vercel AI SDK.
- **Quản Lý Ngữ Cảnh Nâng Cao (Memory):** Hệ thống được thiết lập để tự động ghi nhớ tối đa **20 tin nhắn gần nhất**, giúp AI có thể theo sát và tiếp diễn mạch trò chuyện của học viên mượt mà mà không làm lãng phí bộ nhớ.
- **Giao Diện Đẹp Mắt:** Cấu trúc Layout gồm Sidebar và Main Content, UI Chat sử dụng thư viện **Ant Design** trực quan, gọn gàng, có hiệu ứng tự động cuộn (auto-scroll) tới tin nhắn cuối.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Framework:** Next.js (App Router)
- **AI SDK:** Vercel AI SDK v6 (`ai`, `@ai-sdk/react`, `@ai-sdk/google`)
- **LLM Provider:** Google Gemini API (`gemini-2.5-flash`)
- **UI Components:** Ant Design (Antd) & `@ant-design/icons`
- **Ngôn ngữ:** TypeScript & React (TSX)

---

## 🚀 Hướng Dẫn Cài Đặt (Getting Started)

Làm theo các bước sau để thiết lập và chạy dự án tại máy cá nhân của bạn.

### Yêu cầu hệ thống (Prerequisites)
- [Node.js](https://nodejs.org/) (khuyến nghị phiên bản 18.x hoặc mới nhất)

### 1. Clone Source Code và Cài đặt thư viện
Mở terminal và sao chép source code dự án từ GitHub về máy:

```bash
git clone https://github.com/phucloc12350/vnx_course.git
```

Sau đó, tiến hành cài đặt các gói phụ thuộc:

```bash
npm install
```

### 2. Cấu hình biến môi trường (Environment Variables)
Sao chép `GOOGLE_GENERATIVE_AI_API_KEY` từ Google AI Studio để gọi được model Gemini.
Tạo một file có tên là `.env.local` ở ngay ngoài thư mục gốc dự án (cùng cấp với `package.json`) và dán dòng sau vào:

```env
GOOGLE_GENERATIVE_AI_API_KEY=điền_api_key_của_bạn_vào_đây
ADMIN_USER=điền_admin
ADMIN_PASSWORD=điền_pass
```
*(Lưu ý: Không bao giờ đẩy file `.env.local` lên GitHub vì nó chứa key bí mật của bạn).*

### 3. Khởi chạy ứng dụng
Chạy server ở chế độ Development:

```bash
npm run dev
```

Sau khi Terminal báo thành công, mở trình duyệt biểu diễn qua link:
👉 **[http://localhost:3000](http://localhost:3000)**

---
 

🎉 *Chúc bạn học tiếng Anh vui vẻ cùng Cô Minh!*
