/**
 * Customer entity
 */
export interface Customer {
  id: number;
  id_number: string;
  name: string;
  phone: string;
  email: string | null;
  id_issued_date: string | null;
  address: string;
  created_at: string | null;
  updated_at: string | null;
}

/** Form-level representation used in CreateOrder / CreateWarranty */
export interface CustomerForm {
  idNumber: string;
  name: string;
  phone: string;
  email: string;
  idIssuedDate: string;
  address: string;
}

export const CustomerFields = {
  ID: 'id',
  ID_NUMBER: 'id_number',
  NAME: 'name',
  PHONE: 'phone',
  EMAIL: 'email',
  ID_ISSUED_DATE: 'id_issued_date',
  ADDRESS: 'address',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
  AVERAGE_PRICE: 'average_price',
} as const;

// ── Helpers ──────────────────────────────────

export const createDefaultCustomerForm = (): CustomerForm => ({
  idNumber: '',
  name: '',
  phone: '',
  email: '',
  idIssuedDate: '',
  address: '',
});

/** Maps a Supabase customer row → local form shape */
export const mapCustomerRowToForm = (row: Customer): CustomerForm => ({
  idNumber: row.id_number,
  name: row.name,
  phone: row.phone,
  email: row.email || '',
  idIssuedDate: row.id_issued_date || '',
  address: row.address,
});

/** Builds the insert payload for a new customer row */
export const buildCustomerInsertPayload = (form: CustomerForm): Omit<Customer, 'id' | 'created_at' | 'updated_at'> => ({
  id_number: form.idNumber,
  name: form.name,
  phone: form.phone,
  email: form.email || null,
  id_issued_date: form.idIssuedDate || null,
  address: form.address,
});
