---
name: react-supabase-development 
description: 'End-to-end workflow for React + Supabase development following established patterns. Use for adding new entities, features, pages, or components to the product management app. Includes TypeScript models, Supabase integration, component patterns, and styling guidelines.'
argument-hint: 'Describe the entity/feature you want to build (e.g., "new product category entity" or "order tracking page")'
---

# React + Supabase Development Workflow

Comprehensive development workflow for building features in React + Supabase TypeScript applications following established architectural patterns.

## When to Use
- Adding new database entities with full CRUD operations  
- Building new pages or major features
- Creating reusable components following project patterns
- Implementing Supabase integration with type safety
- Setting up forms, tables, and data management workflows
- Following TypeScript model conventions and file organization

## Prerequisites
Before starting any feature development:
1. Database schema is designed and migrated
2. Supabase RLS policies are configured 
3. Required UI mockups/requirements are available

## Core Development Workflow

### 1. Model-First Architecture
Start with TypeScript models that serve as the architectural hub:

#### Create Entity Model (`src/models/{Entity}.ts`)
Follow the 5-part model structure:
```typescript
// 1. Database interface (snake_case, matches DB schema)
export interface Order {
  id: number;
  created_date: string;
  customer_name: string;
  order_items?: OrderItem[];  // include nested relations
}

// 2. Form interface (camelCase for React state)
export interface OrderForm {
  createDate: string;
  items: OrderItemForm[];
}

// 3. Field constants (for type-safe column access)
export const OrderFields = {
  ID: 'id',
  CREATED_DATE: 'created_date',
  CUSTOMER_NAME: 'customer_name',
} as const;

// 4. Enums with Vietnamese labels & Tailwind styling
export const OrderStatus = { 
  RECEIVED: 'received',
  CUSTOMER_HOLDS: 'customer_holds'
} as const;

export const OrderStatusLabels = { 
  'received': 'Đã nhận hàng',
  'customer_holds': 'Khách giữ hàng' 
};

export const OrderStatusBadgeColors = { 
  'received': 'bg-green-100 text-green-800',
  'customer_holds': 'bg-yellow-100 text-yellow-800'
};

// 5. Builder/mapper functions
export const buildOrderInsertPayload = (form: OrderForm): Omit<Order, 'id'> => ({
  created_date: form.createDate,
  // ... map form to database fields
});

export const mapOrderRowToForm = (row: Order): OrderForm => ({
  createDate: row.created_date,
  // ... map database to form fields
});
```

#### Update Model Index (`src/models/index.ts`)
```typescript
export * from './Order';
export * from './OrderItem';
```

#### Add Queries (`src/models/queries.ts`)
```typescript
export const OrderSelectWithItems = `
  ${OrderFields.ID},
  ${OrderFields.CREATED_DATE},
  ${OrderFields.CUSTOMER_NAME},
  order_items (
    ${OrderItemFields.ID},
    ${OrderItemFields.PRODUCT_NAME}
  )
`;
```

### 2. Page Component Development

#### Create Page Directory Structure
```
src/pages/{feature}/
├── index.js                    # Barrel exports
├── {Entity}List.js             # List/index page
├── {Entity}Detail.js           # Detail/view page  
├── Create{Entity}.js           # Create/edit page
└── components/                 # Feature-specific components
    ├── {Entity}InfoForm.js
    ├── {Entity}InfoCard.js
    ├── {Entity}ListFilters.js
    └── {Entity}Table.js
```

#### Implement Standard Page Pattern
Use this template for all page components:

```javascript
function EntityList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);  
  const [message, setMessage] = useState('');
  const { addNotification } = useNotification();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(Tables.ENTITY)
        .select(EntitySelectWithRelations)
        .order(EntityFields.CREATED_DATE, { ascending: false });
      
      if (error) throw error;
      setData(data);
    } catch (error) { 
      const errorMsg = `Lỗi tải dữ liệu: ${error.message}`;
      setMessage(errorMsg);
      addNotification(errorMsg, 'error', 5000);
    } finally { 
      setLoading(false); 
    }
  };

  if (loading) return <Loading />;
  
  return (
    <div className="p-6">
      <PageHeader 
        title="Danh sách Entity"
        action={<Link to="create" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">Thêm mới</Link>}
      />
      {message && <NotificationBanner message={message} type="error" />}
      <div className="bg-white shadow-sm rounded-lg">
        {/* Content */}
      </div>
    </div>
  );
}
```

### 3. Form Component Patterns

#### Create Reusable Form Segments
```javascript
function EntityInfoForm({ entityForm, onChange, disabled = false }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ngày tạo
        </label>
        <input 
          type="date"
          value={entityForm.createDate}
          onChange={(e) => onChange({ ...entityForm, createDate: e.target.value })}
          disabled={disabled}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
```

### 4. Supabase Integration

#### CRUD Operations
Follow these patterns for all database operations:

```javascript
// Create
const { data, error } = await supabase
  .from(Tables.ENTITY)
  .insert([buildEntityInsertPayload(form)])
  .select(EntitySelectWithRelations)
  .single();

// Read with Relations
const { data, error } = await supabase
  .from(Tables.ENTITY)
  .select(EntitySelectWithRelations)
  .eq(EntityFields.ID, id)
  .single();

// Update
const { data, error } = await supabase
  .from(Tables.ENTITY)
  .update(buildEntityUpdatePayload(form))
  .eq(EntityFields.ID, id)
  .select(EntitySelectWithRelations);

// Soft Delete
const { error } = await supabase
  .from(Tables.ENTITY)
  .update({ deleted_at: new Date().toISOString() })
  .eq(EntityFields.ID, id);
```

#### Storage Operations
```javascript
// Upload file
const { data: uploadData, error: uploadError } = await supabase.storage
  .from(StorageBuckets.PRODUCT_IMAGES)
  .upload(filePath, file);

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from(StorageBuckets.PRODUCT_IMAGES)
  .getPublicUrl(filePath);
```

### 5. Styling with Tailwind CSS

#### Responsive Layout Patterns
```css
/* Container layouts */
.container        → max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
.card            → bg-white shadow-sm rounded-lg p-6
.form-grid       → grid grid-cols-1 md:grid-cols-2 gap-4

/* Interactive elements */
.btn-primary     → bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors
.btn-secondary   → bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors
.btn-danger      → bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors

/* Form inputs */
.form-input      → w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500
.form-label      → block text-sm font-medium text-gray-700 mb-1
```

### 6. Quality Checklist

Before completing any feature:

#### Code Quality
- [ ] TypeScript interfaces for all data structures
- [ ] Field constants used instead of string literals
- [ ] Error handling with Vietnamese user messages
- [ ] Loading states with `<Loading />` component
- [ ] Notification integration for success/error feedback

#### Component Standards
- [ ] Props use TypeScript interfaces
- [ ] Disabled states for form inputs
- [ ] Responsive design with Tailwind breakpoints
- [ ] Consistent spacing and shadows

#### Data Layer
- [ ] Type-safe Supabase queries using field constants
- [ ] Builder functions for insert/update payloads
- [ ] Mapper functions for database-to-form conversion
- [ ] Proper eager loading of related data

#### User Experience
- [ ] Vietnamese text for all user-facing content
- [ ] Consistent button styles and interactions
- [ ] Proper status badges with color coding
- [ ] Currency formatting using `formatCurrency()`
- [ ] Date formatting using `formatDate()` and `formatDateTime()`

## Templates & Reference Files

Quick-start templates available in [assets/](./assets/):
- [entity-model-template.ts](./assets/entity-model-template.ts) - 5-part TypeScript model structure
- [page-list-template.js](./assets/page-list-template.js) - Standard list page component  
- [form-component-template.js](./assets/form-component-template.js) - Reusable form segments

Detailed patterns in [references/](./references/):
- [file-organization.md](./references/file-organization.md) - Project structure & naming
- [component-patterns.md](./references/component-patterns.md) - React patterns & composition
- [supabase-patterns.md](./references/supabase-patterns.md) - Database integration patterns

**Template Usage**: Copy templates and replace `ENTITY_NAME` / `entity_name` placeholders with your actual entity names.

## Success Criteria

A feature is complete when:
1. All CRUD operations work with proper error handling
2. UI is responsive and follows design system
3. TypeScript types are comprehensive and accurate  
4. Code follows established patterns consistently
5. User experience is polished with proper loading/error states