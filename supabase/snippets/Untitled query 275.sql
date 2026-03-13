ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS employee_id bigint,
ADD COLUMN IF NOT EXISTS employee_name character varying(255);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_employee_id_fkey'
  ) THEN
    ALTER TABLE public.orders
    ADD CONSTRAINT orders_employee_id_fkey
    FOREIGN KEY (employee_id) REFERENCES public.employees(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_employee_id
ON public.orders USING btree (employee_id);
