# Component Patterns

## Reusable Form Components

Create composable form segments that accept props and callbacks:

```javascript
// Good: Composable form segment
function CustomerInfoForm({ customerForm, onChange, disabled = false }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="form-label">Tên khách hàng</label>
        <input 
          className="form-input"
          value={customerForm.name}
          onChange={(e) => onChange({ ...customerForm, name: e.target.value })}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
```

## State Management Patterns

### Form State
```javascript
// Use mapped form interfaces, not raw database objects
const [orderForm, setOrderForm] = useState({
  createDate: '',
  customerName: '',
  items: []
});

// Convert between database and form representations
const handleSave = async () => {
  const payload = buildOrderInsertPayload(orderForm);
  // ... save logic
};
```

### Loading & Error States
```javascript
const [loading, setLoading] = useState(true);
const [message, setMessage] = useState('');
const { addNotification } = useNotification();

const handleAsync = async () => {
  try {
    setLoading(true);
    // ... async operation
    addNotification('Thành công!', 'success', 5000);
  } catch (error) {
    const errorMsg = `Lỗi: ${error.message}`;
    setMessage(errorMsg);
    addNotification(errorMsg, 'error', 5000);
  } finally {
    setLoading(false);
  }
};
```

## Component Composition

### Page Layout Pattern
```javascript
return (
  <div className="p-6">
    <PageHeader title="Title" action={<CreateButton />} />
    {message && <NotificationBanner message={message} type="error" />}
    
    <div className="bg-white shadow-sm rounded-lg">
      <div className="p-6">
        {/* Main content */}
      </div>
    </div>
  </div>
);
```

### Conditional Rendering
```javascript
// Loading state
if (loading) return <Loading />;

// Error state
if (error) return <ErrorMessage message={error} />;

// Empty state
if (!data.length) return <EmptyState message="Không có dữ liệu" />;

// Success state
return <DataTable data={data} />;
```

## Performance Patterns

### Debounced Search
```javascript
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 300);
  
  return () => clearTimeout(timer);
}, [searchTerm]);

useEffect(() => {
  if (debouncedSearchTerm) {
    searchData(debouncedSearchTerm);
  }
}, [debouncedSearchTerm]);
```

### Memoized Callbacks
```javascript
const handleItemChange = useCallback((index, updates) => {
  setItems(prev => prev.map((item, i) => 
    i === index ? { ...item, ...updates } : item
  ));
}, []);
```