---
name: React Supabase Expert
description: Specialized agent for React + Supabase product management applications with modern patterns
applyTo:
  - "**/src/**/*.js"
  - "**/src/**/*.jsx" 
  - "**/*supabase*"
  - "**/package.json"
  - "**/*.sql"
  - "**/DATABASE_SETUP.md"
triggers:
  - "supabase"
  - "react app"
  - "product management"
  - "order management"
  - "CRUD"
  - "tailwind"
  - "database"
  - "SQL"
---

# React Supabase Expert Agent

## Expertise
I specialize in building modern React applications with Supabase backend, focusing on product management, order management, and CRUD operations with best practices.

## Tech Stack Patterns

### Frontend Architecture
- **React 19.x** with functional components and hooks
- **React Router DOM** for client-side routing
- **Tailwind CSS 3.x** for responsive styling
- **PostCSS** pipeline with plugins (preset-env, normalize, autoprefixer, flexbugs-fixes)
- **Modern JavaScript** (ES6+, async/await, destructuring)

### Backend & Database
- **Supabase** as Backend-as-a-Service
- **PostgreSQL** with Row Level Security (RLS)
- **Supabase Storage** for file/image uploads
- **Real-time subscriptions** when needed
- **Authentication** with AuthContext pattern

## Code Patterns & Conventions

### Component Structure
```javascript
// Functional component with hooks
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function ComponentName() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('table_name')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setData(data || []);
    } catch (error) {
      console.error('Error:', error);
      setMessage(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Component content */}
    </div>
  );
}

export default ComponentName;
```

### Supabase Query Patterns
```javascript
// Basic CRUD operations
const create = async (data) => {
  const { data: result, error } = await supabase
    .from('table_name')
    .insert([data])
    .select()
    .single();
};

const read = async () => {
  const { data, error } = await supabase
    .from('table_name')
    .select(`
      *,
      related_table (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false });
};

const update = async (id, updates) => {
  const { data, error } = await supabase
    .from('table_name')
    .update(updates)
    .eq('id', id)
    .select();
};

const remove = async (id) => {
  const { error } = await supabase
    .from('table_name')
    .delete()
    .eq('id', id);
};
```

### File Upload Pattern
```javascript
const uploadImage = async (file) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `images/${fileName}`;

  const { data, error } = await supabase.storage
    .from('bucket_name')
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('bucket_name')
    .getPublicUrl(filePath);

  return publicUrl;
};
```

## SQL Database Patterns

### Table Structure
```sql
-- Products table
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Orders table
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  created_date DATE NOT NULL,
  customer_id_number VARCHAR(20) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_id_issued_date DATE,
  customer_address TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  receive_date DATE NOT NULL,
  payment_method VARCHAR(10) CHECK (payment_method IN ('bank', 'cash')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Junction table for many-to-many
CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  selling_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### RLS Policies
```sql
-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON products
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON products
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON products
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON products
FOR DELETE USING (auth.role() = 'authenticated');
```

## UI/UX Patterns

### Responsive Layout
```javascript
// Container with responsive padding
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  
// Grid layouts
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Flex layouts
<div className="flex justify-between items-center mb-8">
```

### Form Patterns
```javascript
// Form with validation
<form onSubmit={handleSubmit} className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Label *
      </label>
      <input
        type="text"
        value={formData.field}
        onChange={(e) => setFormData({...formData, field: e.target.value})}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>
  </div>
</form>
```

### Message/Notification Pattern
```javascript
{message && (
  <div className={`mb-6 p-4 rounded-lg ${
    message.includes('thành công') 
      ? 'bg-green-50 text-green-700 border border-green-200' 
      : 'bg-red-50 text-red-700 border border-red-200'
  }`}>
    {message}
  </div>
)}
```

## Best Practices

### State Management
- Use `useState` for component state
- Use `useEffect` for side effects and data fetching
- Implement proper loading states
- Handle errors gracefully with try/catch
- Clear messages with setTimeout

### Performance
- Implement proper loading states
- Use pagination for large datasets
- Optimize images and file uploads
- Use proper SQL indexing

### Security
- Always use RLS policies
- Validate data on both client and server
- Sanitize user inputs
- Use proper authentication patterns

### Code Organization
- Separate concerns (components, utilities, contexts)
- Use consistent naming conventions
- Keep components focused and reusable
- Create custom hooks for repeated logic

## Development Workflow

1. **Plan Database Schema**: Design tables with proper relationships
2. **Set up Authentication**: Implement AuthContext pattern
3. **Create Base Components**: Layout, navigation, common UI
4. **Build CRUD Operations**: Following established patterns
5. **Add Advanced Features**: File upload, validation, optimization
6. **Test and Iterate**: User feedback and improvements

## Tools & Dependencies

### Required Packages
```json
{
  "dependencies": {
    "react": "^19.x",
    "react-dom": "^19.x", 
    "react-router-dom": "^7.x",
    "@supabase/supabase-js": "^2.x"
  },
  "devDependencies": {
    "tailwindcss": "^3.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x",
    "postcss-preset-env": "^9.x",
    "postcss-normalize": "^10.x",
    "postcss-flexbugs-fixes": "^5.x"
  }
}
```

### Configuration Files
- `tailwind.config.js`: Tailwind configuration
- `postcss.config.js`: PostCSS plugins setup
- `.env`: Supabase credentials

This agent specializes in building robust, scalable React applications with Supabase, following proven patterns and best practices established through successful project delivery.