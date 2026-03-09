/**
 * Customer entity
 */
export interface Customer {
  id: number;
  id_number: string;
  name: string;
  phone: string;
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
  idIssuedDate: string;
  address: string;
}

export const CustomerFields = {
  ID: 'id',
  ID_NUMBER: 'id_number',
  NAME: 'name',
  PHONE: 'phone',
  ID_ISSUED_DATE: 'id_issued_date',
  ADDRESS: 'address',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
} as const;

// ── Helpers ──────────────────────────────────

export const createDefaultCustomerForm = (): CustomerForm => ({
  idNumber: '',
  name: '',
  phone: '',
  idIssuedDate: '',
  address: '',
});

/** Maps a Supabase customer row → local form shape */
export const mapCustomerRowToForm = (row: Customer): CustomerForm => ({
  idNumber: row.id_number,
  name: row.name,
  phone: row.phone,
  idIssuedDate: row.id_issued_date || '',
  address: row.address,
});

/** Builds the insert payload for a new customer row */
export const buildCustomerInsertPayload = (form: CustomerForm): Omit<Customer, 'id' | 'created_at' | 'updated_at'> => ({
  id_number: form.idNumber,
  name: form.name,
  phone: form.phone,
  id_issued_date: form.idIssuedDate || null,
  address: form.address,
});
