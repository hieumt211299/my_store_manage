# Copilot Instructions for React Supabase Product Management App

## Project Context
This is a React-based product management application using Supabase as the backend. The app features product CRUD operations, order management, image uploads, and customer data handling.

## Code Style & Standards

### Frontend Architecture
- **Framework**: React 19.x with functional components and hooks
- **Routing**: React Router DOM with protected routes
- **Styling**: Tailwind CSS 3.x with responsive design
- **State Management**: React hooks (useState, useEffect, custom hooks)
- **Language**: Modern JavaScript (ES6+, async/await, destructuring)

### Backend Integration
- **Database**: Supabase/PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth with AuthContext
- **File Storage**: Supabase Storage for image uploads
- **API**: Supabase client for database operations

## Coding Conventions

### Component Structure
Always structure React components following this pattern:
```javascript
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function ComponentName() {
  // State declarations
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Effects
  useEffect(() => {
    fetchData();
  }, []);

  // Functions
  const fetchData = async () => {
    // Implementation
  };

  // Conditional rendering for loading
  if (loading) {
    return <LoadingComponent />;
  }

  // Main render
  return <MainComponent />;
}

export default ComponentName;
```

### Database Operations
Use this pattern for all Supabase operations:
```javascript
// Always use try/catch with proper error handling
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
```

### Styling Guidelines
- Use Tailwind CSS utility classes consistently
- Follow responsive design patterns: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Use consistent spacing: `space-y-6`, `gap-4`, `mb-8`
- Apply consistent container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Use semantic colors: `text-gray-900`, `bg-blue-600`, `border-gray-300`

### Form Patterns
Always implement forms with proper validation and user feedback:
```javascript
<form onSubmit={handleSubmit} className="space-y-6">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Field Name *
    </label>
    <input
      type="text"
      value={formData.field}
      onChange={(e) => setFormData({...formData, field: e.target.value})}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Enter value"
      required
    />
  </div>
</form>
```

## Database Design Principles

### Table Structure
- Use `BIGSERIAL` for primary keys
- Include `created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())`
- Apply proper constraints (`NOT NULL`, `UNIQUE`, `CHECK`)
- Use descriptive column names

### Relationships
- Implement foreign keys with proper cascading: `REFERENCES table(id) ON DELETE CASCADE`
- Create junction tables for many-to-many relationships
- Use meaningful constraint names

### RLS Policies
Always implement Row Level Security:
```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON table_name
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON table_name
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON table_name
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON table_name
FOR DELETE USING (auth.role() = 'authenticated');
```

## User Experience Patterns

### Loading States
Always provide visual feedback during async operations:
```javascript
if (loading) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Đang tải...</div>
      </div>
    </div>
  );
}
```

### Success/Error Messages
Implement consistent message patterns:
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

### Empty States
Provide helpful empty states with clear calls to action:
```javascript
{data.length === 0 ? (
  <div className="text-center py-12">
    <div className="text-gray-500 text-lg">Chưa có dữ liệu</div>
    <Link to="/create" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
      Tạo mới
    </Link>
  </div>
) : (
  // Render data
)}
```

## File Upload Implementation
Use this pattern for image uploads with Supabase Storage:
```javascript
const handleImageUpload = async (file) => {
  if (!file) return null;

  // Validate file
  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Chỉ chấp nhận file ảnh (JPG, PNG, GIF)');
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('File không được vượt quá 5MB');
  }

  // Upload to Supabase Storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `images/${fileName}`;

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return publicUrl;
};
```

## Project Structure Conventions

### Directory Organization
```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, etc.)
├── lib/               # Utilities (supabase client)
├── pages/             # Page components
├── App.js             # Main app component
└── index.js           # Entry point
```

### Naming Conventions
- **Components**: PascalCase (`ProductList.js`)
- **Files**: PascalCase for components, camelCase for utilities
- **Variables**: camelCase (`productData`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (`API_URL`)
- **CSS Classes**: Follow Tailwind conventions

## Error Handling

### Client-Side Errors
Always provide meaningful error messages to users:
```javascript
catch (error) {
  console.error('Error details:', error);
  setMessage(`Lỗi ${operation}: ${error.message}`);
  // Clear message after delay
  setTimeout(() => setMessage(''), 5000);
}
```

### Form Validation
Implement both client and server-side validation:
```javascript
// Client-side validation
if (!formData.name.trim()) {
  setMessage('Tên sản phẩm không được để trống');
  return;
}

if (!formData.sku.trim()) {
  setMessage('SKU không được để trống');
  return;
}
```

## Performance Considerations

### Data Fetching
- Use proper dependency arrays in useEffect
- Implement cleanup for async operations
- Consider pagination for large datasets

### Component Optimization
- Avoid unnecessary re-renders
- Use proper key props in lists
- Consider useMemo and useCallback for expensive operations

## Security Best Practices

### Input Sanitization
Always validate and sanitize user inputs before database operations.

### Authentication
Protect routes and API calls with proper authentication checks.

### RLS Policies
Never rely solely on client-side security - always implement server-side RLS policies.

## Vietnamese Language Support
- Use Vietnamese for user-facing text
- Implement proper date formatting for Vietnamese locale
- Use Vietnamese currency formatting: `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`

Follow these guidelines consistently to maintain code quality and user experience standards throughout the application.