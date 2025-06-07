-- Create vehicle_listings table
CREATE TABLE IF NOT EXISTS vehicle_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES user_profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  mileage INTEGER,
  price DECIMAL(10,2) NOT NULL,
  condition TEXT CHECK (condition IN ('new', 'used', 'certified')),
  body_type TEXT,
  fuel_type TEXT,
  transmission TEXT,
  drivetrain TEXT,
  exterior_color TEXT,
  interior_color TEXT,
  vin TEXT UNIQUE,
  images TEXT[],
  features TEXT[],
  location_city TEXT,
  location_state TEXT,
  location_zip TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE vehicle_listings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active listings" ON vehicle_listings
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Sellers can manage their own listings" ON vehicle_listings
  FOR ALL USING (auth.uid() = seller_id);
