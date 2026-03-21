# Frontend Code Review Recommendations

## State Management Optimizations

### 1. Optimize CustomerSearchInput with useCallback
```javascript
// Current implementation could cause unnecessary re-renders
const searchCustomers = useCallback(async (term) => {
  // ... existing code
}, [minSearchLength]);

// Better: Include dependencies properly and memoize results
const searchCustomers = useCallback(async (term) => {
  // ... existing code
}, [minSearchLength, supabase]); // Add Supabase client if it changes

// Consider adding result caching
const [searchCache, setSearchCache] = useState(new Map());
```

### 2. Context Performance Optimization
```javascript
// Split contexts for better performance
const AuthStateContext = createContext();
const AuthActionsContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({ user: null, loading: true });
  
  const actions = useMemo(() => ({
    signIn, signOut, signUp
  }), []);

  return (
    <AuthStateContext.Provider value={state}>
      <AuthActionsContext.Provider value={actions}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
};
```

## Component Improvements

### 1. Add Error Boundaries
```javascript
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Add error reporting service here
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Oops! Có lỗi xảy ra
              </h2>
              <p className="text-gray-600 mb-4">
                Ứng dụng đã gặp lỗi không mong muốn. Vui lòng tải lại trang.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Tải lại trang
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 2. Component Memoization
```javascript
// Memoize expensive components
const OrderListItem = memo(({ order, onClick }) => {
  return (
    <tr
      onClick={() => onClick(order.id)}
      className="hover:bg-gray-50 cursor-pointer"
    >
      {/* ... existing row content */}
    </tr>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return prevProps.order.id === nextProps.order.id && 
         prevProps.order.status === nextProps.order.status;
});
```

## TypeScript Integration Improvements

### 1. Strict Component Props
```typescript
interface OrderListProps {
  initialPage?: number;
  itemsPerPage?: number;
  defaultFilters?: Partial<OrderFilters>;
  onOrderSelect?: (orderId: number) => void;
}

interface OrderFilters {
  dateFrom: string;
  dateTo: string;
  customerFilter: string;
  statusFilter: OrderStatusValue[];
}

const OrderList: React.FC<OrderListProps> = ({
  initialPage = 1,
  itemsPerPage = 10,
  defaultFilters = {},
  onOrderSelect,
}) => {
  // Component implementation with type safety
};
```

### 2. Custom Hook Types
```typescript
interface UseOrderListResult {
  orders: Order[];
  loading: boolean;
  error: string | null;
  totalOrders: number;
  currentPage: number;
  filters: OrderFilters;
  actions: {
    fetchOrders: () => Promise<void>;
    updatePage: (page: number) => void;
    updateFilters: (filters: Partial<OrderFilters>) => void;
    clearFilters: () => void;
  };
}

const useOrderList = (config: OrderListConfig): UseOrderListResult => {
  // Custom hook implementation
};
```

## Performance Optimization

### 1. Virtual Scrolling for Large Lists
```javascript
import { FixedSizeList as List } from 'react-window';

const VirtualOrderList = ({ orders, onOrderClick }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <OrderListItem 
        order={orders[index]} 
        onClick={onOrderClick}
      />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={orders.length}
      itemSize={60}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

### 2. Image Optimization
```javascript
// Add image lazy loading and optimization
const OptimizedProductImage = ({ 
  src, 
  alt, 
  className,
  fallback = '/images/product-placeholder.jpg' 
}) => {
  const [imageSrc, setImageSrc] = useState(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (src) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setLoading(false);
      };
      img.onerror = () => {
        setLoading(false);
      };
      img.src = src;
    }
  }, [src]);

  return (
    <div className={`relative ${className}`}>
      <img 
        src={imageSrc}
        alt={alt}
        className={`transition-opacity duration-200 ${
          loading ? 'opacity-50' : 'opacity-100'
        }`}
        loading="lazy"
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
        </div>
      )}
    </div>
  );
};
```

## Accessibility Improvements

### 1. Keyboard Navigation
```javascript
const AccessibleDropdown = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const listRef = useRef(null);

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < options.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : options.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0) {
          onChange(options[focusedIndex].value);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        role="combobox"
      >
        {value || placeholder}
      </button>
      
      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg"
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={index === focusedIndex}
              className={`px-3 py-2 cursor-pointer ${
                index === focusedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

## Testing Strategy

### 1. Component Testing
```javascript
// tests/components/CustomerSearchInput.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createClient } from '@supabase/supabase-js';
import CustomerSearchInput from '../CustomerSearchInput';

jest.mock('@supabase/supabase-js');

describe('CustomerSearchInput', () => {
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue({ data: [], error: null }),
  };

  beforeEach(() => {
    createClient.mockReturnValue(mockSupabase);
  });

  it('should debounce search input', async () => {
    render(<CustomerSearchInput onSelect={jest.fn()} />);
    
    const input = screen.getByPlaceholderText(/nhập số cmnd/i);
    
    fireEvent.change(input, { target: { value: '123' } });
    fireEvent.change(input, { target: { value: '1234' } });
    fireEvent.change(input, { target: { value: '12345' } });
    
    await waitFor(() => {
      expect(mockSupabase.limit).toHaveBeenCalledTimes(1);
    }, { timeout: 500 });
  });

  it('should display search results', async () => {
    const mockCustomers = [
      { id: 1, name: 'John Doe', id_number: '123456789', phone: '0123456789' }
    ];
    
    mockSupabase.limit.mockResolvedValueOnce({ 
      data: mockCustomers, 
      error: null 
    });

    render(<CustomerSearchInput onSelect={jest.fn()} />);
    
    const input = screen.getByPlaceholderText(/nhập số cmnd/i);
    fireEvent.change(input, { target: { value: '123456789' } });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
```

### 2. Integration Testing
```javascript
// tests/integration/OrderCreation.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import CreateOrder from '../../pages/orders/CreateOrder';

const AllTheProviders = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </AuthProvider>
  </BrowserRouter>
);

describe('Order Creation Flow', () => {
  it('should create order successfully', async () => {
    render(<CreateOrder />, { wrapper: AllTheProviders });
    
    // Fill customer information
    fireEvent.change(screen.getByLabelText(/số cmnd/i), {
      target: { value: '123456789' }
    });
    
    // Add products
    fireEvent.click(screen.getByText(/chọn sản phẩm/i));
    
    // Submit form
    fireEvent.click(screen.getByText(/tạo đơn hàng/i));
    
    await waitFor(() => {
      expect(screen.getByText(/tạo đơn hàng thành công/i)).toBeInTheDocument();
    });
  });
});
```

## Security Improvements

### 1. Input Sanitization
```javascript
import DOMPurify from 'dompurify';

const sanitizeInput = (input) => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};

const SafeTextInput = ({ value, onChange, ...props }) => {
  const handleChange = (e) => {
    const sanitizedValue = sanitizeInput(e.target.value);
    onChange(sanitizedValue);
  };

  return (
    <input
      {...props}
      value={value}
      onChange={handleChange}
    />
  );
};
```

### 2. Environment Variable Validation
```javascript
// src/config/environment.js
const validateEnvVars = () => {
  const required = [
    'REACT_APP_SUPABASE_URL',
    'REACT_APP_SUPABASE_ANON_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};

// Call during app initialization
validateEnvVars();
```