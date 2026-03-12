// Template for creating new entity models
// Replace ENTITY_NAME with actual entity name (PascalCase)
// Replace entity_name with lowercase version

// 1. Database interface (snake_case, matches DB schema)
export interface ENTITY_NAME {
  id: number;
  created_date: string;
  updated_date?: string;
  deleted_at?: string;
  // Add entity-specific fields here
}

// 2. Form interface (camelCase for React state)
export interface ENTITY_NAMEForm {
  createDate: string;
  // Add form fields here (camelCase)
}

// 3. Field constants (for type-safe column access)
export const ENTITY_NAMEFields = {
  ID: 'id',
  CREATED_DATE: 'created_date',
  UPDATED_DATE: 'updated_date',
  DELETED_AT: 'deleted_at',
  // Add field constants here
} as const;

// 4. Enums with Vietnamese labels & Tailwind styling (if applicable)
export const ENTITY_NAMEStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export const ENTITY_NAMEStatusLabels = {
  'active': 'Hoạt động',
  'inactive': 'Không hoạt động',
};

export const ENTITY_NAMEStatusBadgeColors = {
  'active': 'bg-green-100 text-green-800',
  'inactive': 'bg-gray-100 text-gray-800',
};

// 5. Builder/mapper functions
export const buildENTITY_NAMEInsertPayload = (form: ENTITY_NAMEForm): Omit<ENTITY_NAME, 'id' | 'created_date' | 'updated_date'> => ({
  // Map form fields to database fields
  // Example: name: form.name,
});

export const buildENTITY_NAMEUpdatePayload = (form: ENTITY_NAMEForm): Partial<Omit<ENTITY_NAME, 'id' | 'created_date'>> => ({
  updated_date: new Date().toISOString(),
  // Map form fields to database fields
  // Example: name: form.name,
});

export const mapENTITY_NAMERowToForm = (row: ENTITY_NAME): ENTITY_NAMEForm => ({
  createDate: row.created_date?.split('T')[0] || '',
  // Map database fields to form fields
  // Example: name: row.name || '',
});
