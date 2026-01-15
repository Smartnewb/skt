-- Add missing columns to applications table

-- Product category (INTERNET_TV, INTERNET_ONLY, INTERNET_PHONE)
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS product_category TEXT;

-- Product discount type (MOBILE_COMBO, SELF_INSTALL, LONG_TERM)
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS product_discount_type TEXT;

-- Referrer name (optional field)
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS applicant_referrer_name TEXT;

-- Add comments for documentation
COMMENT ON COLUMN applications.product_category IS 'Product category type: INTERNET_TV, INTERNET_ONLY, or INTERNET_PHONE';
COMMENT ON COLUMN applications.product_discount_type IS 'Discount type: MOBILE_COMBO, SELF_INSTALL, or LONG_TERM';
COMMENT ON COLUMN applications.applicant_referrer_name IS 'Referrer name provided by applicant (optional)';
