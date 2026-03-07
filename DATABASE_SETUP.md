# Thiết lập Database cho Products

## Bước 1: Tạo bảng products trong Supabase

1. Vào Supabase Dashboard: https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **SQL Editor** (trong sidebar bên trái)
4. Copy và paste SQL code dưới đây vào editor:

```sql
-- Tạo bảng products (cập nhật để hỗ trợ upload ảnh và soft delete)
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL UNIQUE,
  image_url TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng orders
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  created_date DATE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_id_number VARCHAR(50) NOT NULL,
  customer_id_issued_date DATE,
  customer_address TEXT NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  receive_date DATE NOT NULL,
  payment_method VARCHAR(10) NOT NULL CHECK (payment_method IN ('bank', 'cash')) DEFAULT 'bank',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Thay đổi ID đơn hàng bắt đầu từ 100000000 (9 chữ số) thay vì 1
ALTER SEQUENCE orders_id_seq RESTART WITH 100000000;

-- Tạo bảng order_items
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  selling_price DECIMAL(15,2) NOT NULL CHECK (selling_price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo index cho SKU và soft delete để tìm kiếm nhanh hơn
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_deleted_at ON products(deleted_at);
CREATE INDEX idx_orders_created_date ON orders(created_date);
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Bật Row Level Security (RLS) cho tất cả bảng
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Tạo policy để user đã đăng nhập có thể CRUD
CREATE POLICY "Enable all operations for authenticated users" ON products
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON orders
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON order_items
FOR ALL USING (auth.role() = 'authenticated');
```

**Thêm bước mới: Thiết lập Supabase Storage cho upload ảnh**

```sql
-- Tạo bucket cho product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- Tạo policy cho bucket product-images
CREATE POLICY "Give users access to product images" ON storage.objects
FOR ALL USING (bucket_id = 'product-images');
```

5. Nhấn **Run** để chạy SQL

**Lưu ý về ID đơn hàng:** 
Sau khi chạy script trên, ID đơn hàng sẽ bắt đầu từ 100000000 (9 chữ số) thay vì 1, 2, 3... Điều này tạo ID đơn hàng chuyên nghiệp hơn.

## Bước 2: Test thêm dữ liệu mẫu (tùy chọn)

Nếu muốn có dữ liệu mẫu để test:

```sql
-- Thêm sản phẩm mẫu
INSERT INTO products (name, sku, image_url) VALUES 
('iPhone 15 Pro', 'IP15-PRO-001', NULL),
('MacBook Air M3', 'MBA-M3-002', NULL),
('iPad Pro M4', 'IPD-M4-003', NULL),
('AirPods Pro 2', 'APP-002', NULL);

-- Thêm đơn hàng mẫu
INSERT INTO orders (created_date, customer_name, customer_phone, customer_id_number, customer_id_issued_date, customer_address, total_amount, receive_date, payment_method) VALUES 
('2024-03-01', 'Nguyễn Văn An', '0901234567', '123456789012', '2015-05-20', '123 Đường ABC, Quận 1, TP.HCM', 35990000, '2024-03-05', 'bank'),
('2024-03-02', 'Trần Thị Bình', '0912345678', '987654321098', NULL, '456 Đường XYZ, Quận 2, TP.HCM', 6490000, '2024-03-06', 'cash');

-- Thêm chi tiết đơn hàng mẫu (cần chạy sau khi có orders và products)
INSERT INTO order_items (order_id, product_id, quantity, selling_price) VALUES 
(1, 1, 1, 28990000),  -- iPhone cho đơn hàng 1
(1, 4, 1, 6490000),   -- AirPods cho đơn hàng 1  
(2, 4, 1, 6490000);   -- AirPods cho đơn hàng 2
```

## Bước 3: Kiểm tra

1. Vào **Table Editor** trong Supabase
2. Bạn sẽ thấy các bảng sau:
   
   **Bảng `products`:**
   - `id`: Primary key (tự động tăng)
   - `name`: Tên sản phẩm
   - `sku`: Mã sản phẩm (duy nhất)
   - `image_url`: Link ảnh sản phẩm (có thể NULL)
   - `created_at`: Thời gian tạo

   **Bảng `orders`:**
   - `id`: Primary key (tự động tăng) 
   - `created_date`: Ngày tạo đơn hàng
   - `customer_name`: Tên khách hàng
   - `customer_phone`: Số điện thoại
   - `customer_id_number`: Số CMND/CCCD
   - `customer_id_issued_date`: Ngày cấp (có thể NULL)
   - `customer_address`: Địa chỉ
   - `total_amount`: Tổng tiền đơn hàng
   - `receive_date`: Ngày nhận hàng
   - `payment_method`: Phương thức thanh toán (bank/cash)
   - `created_at`: Thời gian tạo

   **Bảng `order_items`:**
   - `id`: Primary key (tự động tăng)
   - `order_id`: Foreign key đến orders
   - `product_id`: Foreign key đến products
   - `quantity`: Số lượng
   - `selling_price`: Giá bán
   - `created_at`: Thời gian tạo

## ⚠️ Chú ý quan trọng

- **Row Level Security (RLS)** được bật để bảo mật
- Chỉ user đã đăng nhập mới có thể tạo/xóa/xem sản phẩm
- SKU phải là duy nhất (không trùng lặp)

## 🚀 Sau khi hoàn thành

Restart ứng dụng React và test:
```bash
npm start
```

Bây giờ bạn có thể:

**Quản lý Sản phẩm:**
- ✅ Xem danh sách sản phẩm với hình ảnh (chỉ hiển thị sản phẩm chưa xóa)
- ✅ Thêm sản phẩm mới với Name, SKU và upload ảnh
- ✅ Upload ảnh tự động lưu vào Supabase Storage
- ✅ Xóa sản phẩm (soft delete - đánh dấu deleted_at thay vì xóa thật)

**Quản lý Đơn hàng:**
- ✅ Xem danh sách đơn hàng với chi tiết đầy đủ
- ✅ Tạo đơn hàng mới với thông tin khách hàng
- ✅ Thêm nhiều sản phẩm vào đơn hàng (chỉ sản phẩm chưa bị xóa)
- ✅ Tính tổng tiền tự động
- ✅ Chọn phương thức thanh toán (bank/cash)
- ✅ Thiết lập ngày tạo và ngày nhận hàng
- ✅ Xóa đơn hàng (tự động xóa chi tiết đơn hàng)

**Dữ liệu được lưu trữ an toàn trong Supabase**

## 📝 Soft Delete cho Sản phẩm

Hệ thống sử dụng **soft delete** cho sản phẩm:
- Khi xóa sản phẩm, cột `deleted_at` sẽ được set = thời gian hiện tại
- Sản phẩm không bị xóa thật khỏi database
- Ứng dụng chỉ hiển thị sản phẩm có `deleted_at = NULL` 

**Khôi phục sản phẩm đã xóa:**
```sql
-- Xem sản phẩm đã bị soft delete
SELECT * FROM products WHERE deleted_at IS NOT NULL;

-- Khôi phục sản phẩm (set deleted_at = NULL)
UPDATE products SET deleted_at = NULL WHERE id = [product_id];
```

**Xóa hoàn toàn sản phẩm cũ (nếu cần):**
```sql
-- Xóa vĩnh viễn sản phẩm đã soft delete quá 1 năm
DELETE FROM products WHERE deleted_at < NOW() - INTERVAL '1 year';
```