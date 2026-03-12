# File Organization Guide

## Feature-Based Structure

Organize by business domain, not technical concern:

```
src/
├── models/                 # Data models & types (architectural hub)
├── pages/{feature}/        # Feature pages
│   ├── index.js           # Barrel exports
│   ├── {Entity}List.js    # List view
│   ├── {Entity}Detail.js  # Detail view
│   ├── Create{Entity}.js  # Create/edit view
│   └── components/        # Feature-specific components
├── components/            # Shared/reusable components
├── contexts/             # Global state providers
├── lib/                  # External service wrappers
└── utils/                # Pure utility functions
```

## Naming Conventions

- **Components/Pages**: PascalCase `.js` (OrderList.js, CreateImport.js)
- **TypeScript models**: PascalCase `.ts` (Order.ts, Customer.ts)
- **Utilities**: camelCase `.js` (analytics.js, formatters.ts)
- **Use index.js** barrel exports for feature folders

## Import Patterns

```javascript
// Models (centralized via barrel export)
import { Order, OrderFields, buildOrderPayload } from '../models';

// Feature components
import OrderInfoForm from './components/OrderInfoForm';

// Shared components  
import { Loading, PageHeader } from '../components';

// Contexts
import { useAuth, useNotification } from '../contexts';

// Libraries
import { supabase } from '../lib/supabase';
```

## Code Organization Within Files

### Page Components
```javascript
// 1. Imports
// 2. Component function
// 3. State declarations
// 4. Effects
// 5. Event handlers
// 6. Render logic
```

### Model Files
```typescript
// 1. Database interfaces
// 2. Form interfaces  
// 3. Field constants
// 4. Enums & labels
// 5. Builder functions
```