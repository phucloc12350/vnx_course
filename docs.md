# Bài tập 1: Xây dựng AI Chatbot "Cô Minh English"

## Công nghệ sử dụng (Tech Stack)
- **Framework**: Next.js (App Router).
- **AI SDK**: Vercel AI SDK v6 (hoặc bản mới nhất).
- **UI Component**: Ant Design (Antd).
- **Lưu trữ**: Local State hoặc Database (để quản lý 20 câu thoại gần nhất).

## Cấu trúc Giao diện (Layout)
- **Sidebar (Menu bên trái)**:
  - Danh sách các bài tập.
  - Mục tiêu chính: Menu "Cô Minh English".
- **Main Content (Bên phải)**:
  - Khung chat hiển thị tin nhắn (Chat Window).
  - Ô nhập liệu và nút gửi (Input & Send button).

## Cấu hình AI (System Prompt)
- **Vai trò**: Giáo viên tiếng Anh tên "Cô Minh".
- **Đối tượng tương tác**: Học viên tên [Tên của bạn].
- **Tính cách/Văn phong**:
  - Hài hước, "nhây", hay trêu chọc học viên để tạo không khí vui vẻ.
  - Sử dụng đan xen tiếng Anh và tiếng Việt để hướng dẫn.
- **Cơ chế hoạt động**: Chatbot tương tác thời gian thực (Streaming).

## Logic Xử lý (Core Logic)
- **Quản lý ngữ cảnh**:
  - AI phải ghi nhớ tối đa 20 tin nhắn gần nhất (bao gồm cả nội dung của User và AI) trong mỗi lượt gửi yêu cầu (Request).
  - Sử dụng mảng `messages` từ `useChat` hook của Vercel AI SDK và giới hạn độ dài bằng `slice(-20)`.

## Mục tiêu bài tập
- Làm quen với việc cấu hình System Prompt để định hình tính cách AI.
- Thực hành quản lý Chat History (Context window) trong ứng dụng thực tế.
- Kết hợp Vercel AI SDK với một thư viện UI phổ biến (Ant Design).
