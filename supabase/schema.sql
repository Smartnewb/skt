-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Product Info
  product_id TEXT,
  product_speed TEXT,
  product_tv_type TEXT,
  product_monthly_price INTEGER,
  product_cash_benefit INTEGER,
  product_wifi_router BOOLEAN DEFAULT false,
  
  -- Applicant Info
  applicant_customer_type TEXT,
  applicant_name TEXT,
  applicant_birth_date TEXT,
  applicant_gender TEXT,
  applicant_business_name TEXT,
  applicant_business_reg_number TEXT,
  applicant_carrier TEXT,
  applicant_phone TEXT,
  applicant_emergency_phone TEXT,
  applicant_email TEXT,
  applicant_zipcode TEXT,
  applicant_address_basic TEXT,
  applicant_address_detail TEXT,
  
  -- Payment Info
  payment_method TEXT,
  payment_bank_code TEXT,
  payment_account_number TEXT,
  payment_card_company TEXT,
  payment_card_number TEXT,
  payment_card_expiry TEXT,
  payment_card_birth_date TEXT,
  
  -- Gift Recipient Info
  gift_relationship TEXT,
  gift_resident_type TEXT,
  gift_name TEXT,
  gift_birth_date_or_reg_number TEXT,
  gift_bank_code TEXT,
  gift_account_number TEXT,
  gift_card_option TEXT,
  
  -- Terms & Additional
  customer_request TEXT,
  
  -- Metadata
  status TEXT DEFAULT 'PENDING',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_submitted_at ON applications(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_applicant_phone ON applications(applicant_phone);

-- Enable Row Level Security (RLS)
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can restrict this later)
CREATE POLICY "Allow all operations for now" ON applications
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
