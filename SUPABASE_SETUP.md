# Hướng dẫn thiết lập Supabase

## Bước 1: Tạo tài khoản Supabase

1. Truy cập [supabase.com](https://supabase.com) và đăng ký tài khoản miễn phí
2. Đăng nhập bằng GitHub hoặc email

## Bước 2: Tạo Project mới

1. Nhấn "New Project"
2. Chọn tổ chức (organization) 
3. Điền thông tin project:
   - **Name**: product-app (hoặc tên bạn muốn)
   - **Database Password**: Tạo password mạnh (LƯU LẠI password này)
   - **Region**: Chọn Southeast Asia (Singapore) để độ trễ thấp
4. Nhấn "Create new project"
5. Chờ 1-2 phút để Supabase khởi tạo project

## Bước 3: Lấy API Keys

1. Trong project dashboard, vào **Settings** → **API** 
2. Sao chép 2 giá trị:
   - **Project URL** (dạng: https://xxx.supabase.co)
   - **anon public** key (dài khoảng 100 ký tự)

## Bước 4: Cập nhật file .env

Mở file `.env` trong thư mục project và thay thế:

\`\`\`env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

## Bước 5: Bật Email Authentication

1. Trong Supabase dashboard, vào **Authentication** → **Settings**  
2. Ở phần **Auth Providers**, đảm bảo **Email** được bật
3. Có thể tùy chỉnh email templates ở phần **Email Templates**

## Bước 6: Restart ứng dụng

Sau khi cập nhật `.env`, restart React app:
\`\`\`bash
Ctrl+C  # Dừng server
npm start  # Khởi động lại
\`\`\`

## Bước 7: Test đăng ký/đăng nhập

1. Mở http://localhost:3000
2. Thử đăng ký tài khoản mới với email thật
3. Kiểm tra email để xác thực (check cả spam)
4. Đăng nhập sau khi xác thực

## Kiểm tra Users

Vào **Authentication** → **Users** trong Supabase dashboard để xem danh sách users đã đăng ký.

## Troubleshooting

### Lỗi "Invalid login credentials"
- Kiểm tra email/password
- Đảm bảo đã xác thực email

### Lỗi "supabaseUrl or supabaseKey"  
- Kiểm tra file .env
- Đảm bảo variable names đúng
- Restart app sau khi sửa .env

### Email không nhận được
- Kiểm tra spam folder
- Thử email khác
- Kiểm tra Email settings trong Supabase dashboard