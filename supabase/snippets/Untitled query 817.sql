-- Add order_type field to orders table
ALTER TABLE "public"."orders" 
ADD COLUMN "order_type" character varying(20) NOT NULL DEFAULT 'order';

-- Add comment for the field
COMMENT ON COLUMN "public"."orders"."order_type" IS 'Type of order: order or warranty';