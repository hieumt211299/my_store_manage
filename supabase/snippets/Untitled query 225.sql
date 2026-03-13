DROP INDEX IF EXISTS public.idx_orders_employee_id;

ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_employee_id_fkey;

ALTER TABLE public.orders
DROP COLUMN IF EXISTS employee_id,
DROP COLUMN IF EXISTS employee_name;
