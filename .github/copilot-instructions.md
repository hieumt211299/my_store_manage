# Product Management App - Development Guidelines

## Architecture & Organization

This is a React + Supabase TypeScript application for product management. Follow these established patterns:

### Project Structure
- `src/models/` - TypeScript data models, field constants, and query fragments (architectural hub)  
- `src/components/` - Reusable UI components  
- `src/pages/` - Page components organized by feature (`orders/`, `imports/`) 
- `src/contexts/` - Global state (AuthContext, NotificationContext)
- `src/lib/` - External service wrappers (Supabase client)
- `src/utils/` - Pure utility functions

### File Naming
- Components/Pages: PascalCase `.js` (OrderList.js, CreateImport.js)
- TypeScript models: PascalCase `.ts` (Order.ts, Customer.ts)  
- Utilities: camelCase `.js` (analytics.js, formatters.ts)
- Use `index.js` barrel exports for feature folders

## TypeScript Model Patterns

Every data entity follows a 5-part structure in `src/models/`:

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
} as const;

// 4. Enums with Vietnamese labels & Tailwind styling
export const OrderStatus = { RECEIVED: 'received' } as const;
export const OrderStatusLabels = { 'received': 'Đã nhận hàng' };
export const OrderStatusBadgeColors = { 'received': 'bg-green-100 text-green-800' };

// 5. Builder/mapper functions
export const buildOrderInsertPayload = (form: OrderForm): Omit<Order, 'id'> => ({...});
export const mapOrderRowToForm = (row: Order): OrderForm => ({...});
```

Export all models via `src/models/index.ts` barrel file for centralized imports.

## Component Patterns

### Page Component Standard
```javascript
function PageName() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);  
  const [message, setMessage] = useState('');
  const { addNotification } = useNotification();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from(Tables.X).select(...);
      if (error) throw error;
      setData(data);
    } catch (error) { 
      setMessage(`Lỗi: ${error.message}`);
      addNotification(`Lỗi: ${error.message}`, 'error', 5000);
    } finally { 
      setLoading(false); 
    }
  };

  if (loading) return <Loading />;
  return (...);
}
```

### Form Components
Create reusable form segments that accept props and onChange callbacks:
```javascript
function OrderInfoForm({ orderForm, onChange, disabled = false }) {
  return (
    <input 
      value={orderForm.createDate}
      onChange={(e) => onChange({ ...orderForm, createDate: e.target.value })}
      disabled={disabled}
    />
  );
}
```

## Supabase Integration

### Type-Safe Queries
- Define reusable select fragments in `src/models/queries.ts`
- Use field constants for column names to prevent typos
- Always include error handling with user-friendly Vietnamese messages

```typescript
const { data, error, count } = await supabase
  .from(Tables.ORDERS)
  .select(OrderSelectWithCustomerAndItems, { count: 'exact' })
  .gte(OrderFields.CREATED_DATE, dateFrom)
  .order(OrderFields.CREATED_DATE, { ascending: false });
```

### CRUD Patterns
- Create: `.insert([data]).select().single()`
- Update: `.update(payload).eq('id', id).select()`  
- Soft delete: `.update({ deleted_at: now() })`

### Storage Operations
```javascript
const { data: { publicUrl } } = supabase.storage
  .from(StorageBuckets.PRODUCT_IMAGES)
  .getPublicUrl(filePath);
```

## Styling with Tailwind CSS

### Standard Patterns
- Responsive flexbox: `flex flex-1 space-x-4 items-center`
- Grid layouts: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- Consistent spacing: `p-6 mb-4 px-3 py-2`
- Form styling: `border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`
- Shadows: `shadow-sm` for cards
- Status indicators: Use colors from model status badge definitions

### Button Styles
- Primary: `bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md`
- Secondary: `bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md`
- Danger: `bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md`

## Localization & Formatting

- All user-facing text in Vietnamese
- Use formatters from `src/models/formatters.ts`:
  - `formatCurrency(amount)` - Vietnamese dong format with proper separators
  - `formatDate(dateStr)` - Vietnamese locale date format  
  - `formatDateTime(dateStr)` - Full date/time with Vietnamese formatting

## Global State & Context

### Authentication
```javascript
const { user, signIn, signOut } = useAuth();
if (!user) return <Login />;
```

### Notifications
```javascript
const { addNotification } = useNotification();
addNotification('Đơn hàng tạo thành công!', 'success', 5000);
addNotification(`Lỗi: ${error.message}`, 'error', 5000);
```

## Performance Patterns

### Debounced Search
```javascript
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

useEffect(() => {
  const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
  return () => clearTimeout(timer);
}, [searchTerm]);
```

### Memoized Callbacks
Use `useCallback` for functions passed to child components or used in dependency arrays.

## Build & Development

### Setup
```bash
npm install
npm start  # Runs on http://localhost:3000
```

### Key Dependencies
- React 19.2.4 with hooks
- React Router DOM 7.13.1 for navigation
- Tailwind CSS 3.4.0 for styling
- Supabase 2.77.0 for backend
- React Icons 5.6.0 for icons
- Recharts 3.8.0 for charts

### Environment
Create `.env.local` with:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

## Domain-Specific Conventions

### Order Management
- Customer types: ONLINE, OFFLINE
- Payment methods: BANK (Chuyển khoản), CASH (Tiền mặt)
- Order statuses: RECEIVED, CUSTOMER_HOLDS, STORE_HOLDS

### Import Management  
- Source types: ANCARAT (từ Ancarat), CUSTOMER (từ khách bán)
- Include Ancarat-specific fields: invoice number, cashier name, expected return date
- For customer sellers: ID, name, phone, address, ID issued date

Always follow the established patterns in existing components for consistency.
