-- Script để thay đổi ID đơn hàng bắt đầu từ 100000000

-- Bước 1: Kiểm tra sequence hiện tại của bảng orders
-- SELECT currval('orders_id_seq'); -- Xem giá trị hiện tại

-- Bước 2: Thay đổi sequence bắt đầu từ 100000000
-- Chỉ chạy lệnh này nếu chưa có đơn hàng nào hoặc muốn reset
ALTER SEQUENCE orders_id_seq RESTART WITH 100000000;

-- Hoặc nếu đã có data và muốn bắt đầu từ số lớn hơn hiện tại
-- SELECT setval('orders_id_seq', 100000000, false);

-- Bước 3: Kiểm tra sequence đã thay đổi
SELECT last_value FROM orders_id_seq;

-- Bước 4: Test tạo đơn hàng mới sẽ có ID bắt đầu từ 100000000
-- INSERT INTO orders (created_date, customer_name, customer_phone, customer_id_number, customer_address, total_amount, receive_date, payment_method) 
-- VALUES (CURRENT_DATE, 'Test User', '0901234567', '123456789012', 'Test Address', 1000000, CURRENT_DATE + 7, 'bank');
-- SELECT * FROM orders ORDER BY id DESC LIMIT 1;

-- LƯU Ý: 
-- - Nếu database đã có data, hãy backup trước khi chạy
-- - Đơn hàng mới sẽ có ID từ 100000000, 100000001, 100000002...
-- - Code React không cần thay đổi vì ID vẫn tự động tạo