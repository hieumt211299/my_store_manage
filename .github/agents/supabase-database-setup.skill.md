---
name: Supabase Database Setup
description: Specialized skill for creating PostgreSQL database schemas and RLS policies optimized for Supabase, with focus on product management and e-commerce patterns.
applyTo:
  - "**/*.sql"
  - "**/DATABASE_SETUP.md"
  - "**/SUPABASE_SETUP.md"
triggers:
  - "database setup"
  - "SQL schema"
  - "create table"
  - "RLS policy"
  - "supabase database"
  - "postgresql"
---

# Supabase Database Setup Skill

## Overview
This skill provides comprehensive database schema design and RLS policy creation for Supabase projects, with proven patterns for product management, e-commerce, and business applications.

## Core Competencies

### 1. Table Schema Design
Create robust tables with proper constraints, relationships, and indexes.

### 2. Row Level Security (RLS)
Implement comprehensive security policies for authenticated users.

### 3. Junction Tables
Design efficient many-to-many relationships.

### 4. Data Integrity
Ensure consistency with foreign keys, constraints, and cascading rules.

## Standard Schema Templates

### Products Table
```sql
-- Products table for inventory management
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) CHECK (price >= 0),
  cost_price DECIMAL(10,2) CHECK (cost_price >= 0),
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_created_at ON products(created_at);
```

### Orders and Order Items
```sql
-- Orders table for order management
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  created_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Customer information
  customer_id_number VARCHAR(20) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  customer_id_issued_date DATE,
  customer_address TEXT NOT NULL,
  
  -- Order details
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  tax_amount DECIMAL(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
  discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
  shipping_cost DECIMAL(10,2) DEFAULT 0 CHECK (shipping_cost >= 0),
  
  -- Dates and status
  receive_date DATE NOT NULL,
  shipping_date DATE,
  payment_method VARCHAR(20) CHECK (payment_method IN ('bank', 'cash', 'card', 'transfer')) NOT NULL,
  order_status VARCHAR(20) DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  
  -- Notes and metadata
  notes TEXT,
  internal_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Order items junction table
CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  selling_price DECIMAL(10,2) NOT NULL CHECK (selling_price >= 0),
  discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
  total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * selling_price - discount_amount) STORED,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for orders
CREATE INDEX idx_orders_customer_id ON orders(customer_id_number);
CREATE INDEX idx_orders_created_date ON orders(created_date);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
```

### Categories and Tags System
```sql
-- Categories for hierarchical organization
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  parent_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tags for flexible labeling
CREATE TABLE tags (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Product tags junction table
CREATE TABLE product_tags (
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  tag_id BIGINT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Customers and Addresses
```sql
-- Customers table for relationship management
CREATE TABLE customers (
  id BIGSERIAL PRIMARY KEY,
  id_number VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) NOT NULL,
  id_issued_date DATE,
  date_of_birth DATE,
  customer_type VARCHAR(20) DEFAULT 'individual' CHECK (customer_type IN ('individual', 'business')),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Customer addresses
CREATE TABLE customer_addresses (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Vietnam',
  is_default BOOLEAN DEFAULT false,
  address_type VARCHAR(20) DEFAULT 'home' CHECK (address_type IN ('home', 'office', 'shipping', 'billing')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

## Row Level Security (RLS) Policies

### Standard RLS Setup
```sql
-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Enable read access for authenticated users" ON products
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON products
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON products
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON products
FOR DELETE USING (auth.role() = 'authenticated');

-- Orders policies
CREATE POLICY "Enable read access for authenticated users" ON orders
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON orders
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON orders
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON orders
FOR DELETE USING (auth.role() = 'authenticated');

-- Order items policies
CREATE POLICY "Enable read access for authenticated users" ON order_items
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON order_items
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON order_items
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON order_items
FOR DELETE USING (auth.role() = 'authenticated');

-- Apply similar policies to all tables...
```

### Advanced RLS with User Roles
```sql
-- User-specific policies (if implementing user-based access)
CREATE POLICY "Users can view their own orders" ON orders
FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can manage all data" ON products
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);
```

## Storage Bucket Setup
```sql
-- Create storage bucket policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- Storage policies
CREATE POLICY "Enable read access for all users" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Enable insert for authenticated users" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
```

## Utility Functions and Triggers

### Auto-update timestamps
```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables with updated_at
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_customers_updated_at 
  BEFORE UPDATE ON customers 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
```

### Order number generation
```sql
-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'ORD' || TO_CHAR(NEW.created_date, 'YYYYMMDD') || '-' || LPAD(NEW.id::text, 6, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for order number generation
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE PROCEDURE generate_order_number();
```

## Sample Data Insertion
```sql
-- Sample categories
INSERT INTO categories (name, slug, description) VALUES
('Electronics', 'electronics', 'Electronic devices and accessories'),
('Clothing', 'clothing', 'Apparel and fashion items'),
('Books', 'books', 'Books and publications');

-- Sample products
INSERT INTO products (name, sku, description, price, stock_quantity, category_id) VALUES
('iPhone 15 Pro', 'IPHONE15PRO', 'Latest iPhone model', 29990000, 10, 1),
('Cotton T-Shirt', 'TSHIRT001', 'Comfortable cotton t-shirt', 299000, 50, 2),
('JavaScript Guide', 'JSBOOK001', 'Complete JavaScript programming guide', 450000, 25, 3);

-- Sample customer
INSERT INTO customers (id_number, name, email, phone) VALUES
('123456789', 'Nguyen Van A', 'nguyenvana@email.com', '0901234567');
```

## Best Practices

### Data Integrity
1. Always use foreign key constraints with appropriate cascading
2. Implement check constraints for data validation
3. Use NOT NULL where appropriate
4. Create unique constraints for business keys

### Performance
1. Create indexes on frequently queried columns
2. Use compound indexes for multi-column searches
3. Consider partial indexes for filtered queries
4. Monitor query performance with EXPLAIN

### Security
1. Enable RLS on all user-data tables
2. Create specific policies for different user roles
3. Never expose sensitive data in policies
4. Regular audit of policy effectiveness

### Maintenance
1. Include created_at and updated_at timestamps
2. Implement soft deletes where appropriate
3. Use meaningful constraint names
4. Document complex business rules

This skill ensures robust, secure, and performant database foundations for React-Supabase applications.