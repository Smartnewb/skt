-- Create consultations table
CREATE TABLE consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Product information
  product_speed TEXT NOT NULL CHECK (product_speed IN ('100M', '500M', '1G')),
  product_bundle TEXT NOT NULL CHECK (product_bundle IN ('INTERNET_ONLY', 'INTERNET_BTV_ECONOMY', 'INTERNET_BTV_STANDARD', 'INTERNET_BTV_ALL')),
  discount_type TEXT NOT NULL CHECK (discount_type IN ('GENERAL', 'MOBILE', 'FAMILY')),
  monthly_price INTEGER NOT NULL,
  gift_amount INTEGER NOT NULL,

  -- Customer information
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  privacy_consent BOOLEAN NOT NULL DEFAULT false,

  -- Status and timestamps
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONTACTED', 'COMPLETED')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_submitted_at ON consultations(submitted_at DESC);

-- Create trigger to update updated_at
CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous inserts (for form submissions)
CREATE POLICY "Allow anonymous insert" ON consultations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy for authenticated read (for admin)
CREATE POLICY "Allow authenticated read" ON consultations
  FOR SELECT
  TO authenticated
  USING (true);
