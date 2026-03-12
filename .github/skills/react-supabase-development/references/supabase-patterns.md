# Supabase Integration Patterns

## Query Construction

### Type-Safe Column Selection
Always use field constants to prevent typos:

```javascript
// ✅ Good: Type-safe with constants
const { data } = await supabase
  .from(Tables.ORDERS)
  .select(`
    ${OrderFields.ID},
    ${OrderFields.CREATED_DATE},
    ${OrderFields.CUSTOMER_NAME}
  `);

// ❌ Bad: String literals prone to typos
const { data } = await supabase
  .from('orders')
  .select('id, created_date, customer_name');
```

### Eager Loading Relations
Define reusable select fragments in `models/queries.ts`:

```typescript
export const OrderSelectWithCustomerAndItems = `
  ${OrderFields.ID},
  ${OrderFields.CREATED_DATE},
  ${OrderFields.CUSTOMER_NAME},
  customer:${OrderFields.CUSTOMER_ID} (
    ${CustomerFields.ID},
    ${CustomerFields.NAME},
    ${CustomerFields.PHONE}
  ),
  order_items (
    ${OrderItemFields.ID},
    ${OrderItemFields.PRODUCT_NAME},
    ${OrderItemFields.QUANTITY},
    ${OrderItemFields.PRICE}
  )
`;
```

## CRUD Patterns

### Create with Return Data
```javascript
const createOrder = async (orderForm) => {
  const payload = buildOrderInsertPayload(orderForm);
  
  const { data, error } = await supabase
    .from(Tables.ORDERS)
    .insert([payload])
    .select(OrderSelectWithCustomerAndItems)
    .single();
    
  if (error) throw error;
  return data;
};
```

### Update with Optimistic Response
```javascript
const updateOrder = async (id, orderForm) => {
  const payload = buildOrderUpdatePayload(orderForm);
  
  const { data, error } = await supabase
    .from(Tables.ORDERS)
    .update(payload)
    .eq(OrderFields.ID, id)
    .select(OrderSelectWithCustomerAndItems)
    .single();
    
  if (error) throw error;
  return data;
};
```

### Soft Delete Pattern
```javascript
const deleteOrder = async (id) => {
  const { error } = await supabase
    .from(Tables.ORDERS)
    .update({ deleted_at: new Date().toISOString() })
    .eq(OrderFields.ID, id);
    
  if (error) throw error;
};
```

## Filtering & Search

### Date Range Filters
```javascript
let query = supabase
  .from(Tables.ORDERS)
  .select(OrderSelectWithCustomerAndItems);

if (dateFrom) {
  query = query.gte(OrderFields.CREATED_DATE, dateFrom);
}

if (dateTo) {
  query = query.lte(OrderFields.CREATED_DATE, dateTo);
}

const { data, error } = await query
  .order(OrderFields.CREATED_DATE, { ascending: false });
```

### Text Search
```javascript
if (searchTerm) {
  query = query.or(`
    ${CustomerFields.NAME}.ilike.%${searchTerm}%,
    ${CustomerFields.PHONE}.ilike.%${searchTerm}%
  `);
}
```

## Pagination

```javascript
const fetchOrdersWithPagination = async (page, pageSize = 10) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  const { data, error, count } = await supabase
    .from(Tables.ORDERS)
    .select(OrderSelectWithCustomerAndItems, { count: 'exact' })
    .range(from, to)
    .order(OrderFields.CREATED_DATE, { ascending: false });
    
  if (error) throw error;
  
  return {
    data,
    totalCount: count,
    totalPages: Math.ceil(count / pageSize),
    currentPage: page
  };
};
```

## Error Handling

### Standard Error Pattern
```javascript
try {
  const { data, error } = await supabase
    .from(Tables.ORDERS)
    .select('*');
    
  if (error) throw error;
  return data;
} catch (error) {
  // Log for debugging
  console.error('Database error:', error);
  
  // User-friendly Vietnamese message
  const userMessage = error.code === 'PGRST116' 
    ? 'Không tìm thấy dữ liệu'
    : `Lỗi tải dữ liệu: ${error.message}`;
    
  throw new Error(userMessage);
}
```

## Real-time Features

### Subscribe to Changes
```javascript
useEffect(() => {
  const subscription = supabase
    .channel('orders-channel')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: Tables.ORDERS
    }, (payload) => {
      console.log('New order:', payload.new);
      // Update local state
      setOrders(prev => [payload.new, ...prev]);
    })
    .subscribe();
    
  return () => {
    supabase.removeChannel(subscription);
  };
}, []);
```

## Performance Optimization

### Selective Loading
```javascript
// Only load what's needed for the list view
const OrderListSelect = `
  ${OrderFields.ID},
  ${OrderFields.CREATED_DATE},
  ${OrderFields.CUSTOMER_NAME},
  ${OrderFields.STATUS}
`;

// Full details only for detail view
const OrderDetailSelect = OrderSelectWithCustomerAndItems;
```

### Connection Pooling
```javascript
// Use single supabase instance
import { supabase } from '../lib/supabase';

// Don't create new clients
// ❌ const client = createClient(url, key);
```