-- Make product fields nullable for consultations without product selection
ALTER TABLE consultations
  ALTER COLUMN product_speed DROP NOT NULL,
  ALTER COLUMN product_bundle DROP NOT NULL,
  ALTER COLUMN discount_type DROP NOT NULL,
  ALTER COLUMN monthly_price DROP NOT NULL,
  ALTER COLUMN gift_amount DROP NOT NULL;
