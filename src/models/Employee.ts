// ── Enums ────────────────────────────────────

export const EmployeeRole = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
} as const;

export type EmployeeRoleValue = (typeof EmployeeRole)[keyof typeof EmployeeRole];

export const EmployeeRoleLabels: Record<EmployeeRoleValue, string> = {
  [EmployeeRole.ADMIN]: 'Quản trị viên',
  [EmployeeRole.MANAGER]: 'Quản lý',
  [EmployeeRole.STAFF]: 'Nhân viên',
};

export const EmployeeRoleBadgeColors: Record<EmployeeRoleValue, string> = {
  [EmployeeRole.ADMIN]: 'bg-red-100 text-red-800',
  [EmployeeRole.MANAGER]: 'bg-blue-100 text-blue-800',
  [EmployeeRole.STAFF]: 'bg-green-100 text-green-800',
};

export const EmployeeStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;

export type EmployeeStatusValue = (typeof EmployeeStatus)[keyof typeof EmployeeStatus];

export const EmployeeStatusLabels: Record<EmployeeStatusValue, string> = {
  [EmployeeStatus.ACTIVE]: 'Hoạt động',
  [EmployeeStatus.INACTIVE]: 'Nghỉ việc',
  [EmployeeStatus.SUSPENDED]: 'Tạm ngừng',
};

export const EmployeeStatusBadgeColors: Record<EmployeeStatusValue, string> = {
  [EmployeeStatus.ACTIVE]: 'bg-green-100 text-green-800',
  [EmployeeStatus.INACTIVE]: 'bg-gray-100 text-gray-800',
  [EmployeeStatus.SUSPENDED]: 'bg-yellow-100 text-yellow-800',
};

// ── Entity ───────────────────────────────────

/**
 * Employee entity
 */
export interface Employee {
  id: number;
  employee_code: string;
  full_name: string;
  email: string;
  phone: string;
  id_number: string;
  id_issued_date: string | null;
  address: string;
  role: string;
  status: string;
  hire_date: string;
  salary: number | null;
  department: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

/** Form-level representation for CreateEmployee / EditEmployee */
export interface EmployeeForm {
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  idNumber: string;
  idIssuedDate: string;
  address: string;
  role: string;
  status: string;
  hireDate: string;
  salary: string;
  department: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export const EmployeeFields = {
  ID: 'id',
  EMPLOYEE_CODE: 'employee_code',
  FULL_NAME: 'full_name',
  EMAIL: 'email',
  PHONE: 'phone',
  ID_NUMBER: 'id_number',
  ID_ISSUED_DATE: 'id_issued_date',
  ADDRESS: 'address',
  ROLE: 'role',
  STATUS: 'status',
  HIRE_DATE: 'hire_date',
  SALARY: 'salary',
  DEPARTMENT: 'department',
  EMERGENCY_CONTACT_NAME: 'emergency_contact_name',
  EMERGENCY_CONTACT_PHONE: 'emergency_contact_phone',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
  DELETED_AT: 'deleted_at',
} as const;

// ── Display helpers ──────────────────────────

export const getRoleDisplay = (role: string): string =>
  EmployeeRoleLabels[role as EmployeeRoleValue] || EmployeeRoleLabels[EmployeeRole.STAFF];

export const getRoleBadgeColor = (role: string): string =>
  EmployeeRoleBadgeColors[role as EmployeeRoleValue] || EmployeeRoleBadgeColors[EmployeeRole.STAFF];

export const getStatusDisplay = (status: string): string =>
  EmployeeStatusLabels[status as EmployeeStatusValue] || EmployeeStatusLabels[EmployeeStatus.ACTIVE];

export const getStatusBadgeColor = (status: string): string =>
  EmployeeStatusBadgeColors[status as EmployeeStatusValue] || EmployeeStatusBadgeColors[EmployeeStatus.ACTIVE];

// ── Helpers ──────────────────────────────────

export const createDefaultEmployeeForm = (): EmployeeForm => ({
  employeeCode: '',
  fullName: '',
  email: '',
  phone: '',
  idNumber: '',
  idIssuedDate: '',
  address: '',
  role: EmployeeRole.STAFF,
  status: EmployeeStatus.ACTIVE,
  hireDate: new Date().toISOString().split('T')[0],
  salary: '',
  department: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
});

/** Maps a Supabase employee row → local form shape */
export const mapEmployeeRowToForm = (row: Employee): EmployeeForm => ({
  employeeCode: row.employee_code,
  fullName: row.full_name,
  email: row.email,
  phone: row.phone,
  idNumber: row.id_number,
  idIssuedDate: row.id_issued_date || '',
  address: row.address,
  role: row.role,
  status: row.status,
  hireDate: row.hire_date,
  salary: row.salary ? row.salary.toString() : '',
  department: row.department || '',
  emergencyContactName: row.emergency_contact_name || '',
  emergencyContactPhone: row.emergency_contact_phone || '',
});

/** Builds the insert payload for a new employee */
export const buildEmployeeInsertPayload = (form: EmployeeForm): Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> => ({
  employee_code: form.employeeCode,
  full_name: form.fullName,
  email: form.email,
  phone: form.phone,
  id_number: form.idNumber,
  id_issued_date: form.idIssuedDate || null,
  address: form.address,
  role: form.role,
  status: form.status,
  hire_date: form.hireDate,
  salary: form.salary ? parseFloat(form.salary) : null,
  department: form.department || null,
  emergency_contact_name: form.emergencyContactName || null,
  emergency_contact_phone: form.emergencyContactPhone || null,
});

/** Builds the update payload for an existing employee */
export const buildEmployeeUpdatePayload = (form: EmployeeForm): Partial<Employee> => ({
  employee_code: form.employeeCode,
  full_name: form.fullName,
  email: form.email,
  phone: form.phone,
  id_number: form.idNumber,
  id_issued_date: form.idIssuedDate || null,
  address: form.address,
  role: form.role,
  status: form.status,
  hire_date: form.hireDate,
  salary: form.salary ? parseFloat(form.salary) : null,
  department: form.department || null,
  emergency_contact_name: form.emergencyContactName || null,
  emergency_contact_phone: form.emergencyContactPhone || null,
});

/** Generate employee code based on hire date and count */
export const generateEmployeeCode = (hireDate: string, count: number): string => {
  const date = new Date(hireDate);
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const sequence = (count + 1).toString().padStart(3, '0');
  return `NV${year}${month}${sequence}`;
};