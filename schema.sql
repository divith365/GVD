-- ====================================================================
-- GVD AutoCare Cloudflare D1 Database Schema
-- ====================================================================

-- 1. Service Centers Table (Car / Bike)
CREATE TABLE IF NOT EXISTS service_centers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT CHECK(type IN ('car', 'bike')) NOT NULL,
  contact TEXT,
  email TEXT,
  address TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users & Managers Table (PIN-based authentication for managers)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin', 'manager')) NOT NULL,
  phone TEXT,
  email TEXT,
  pin TEXT, -- 4-digit PIN for manager quick login
  password_hash TEXT, -- For admin login
  service_center_id TEXT REFERENCES service_centers(id) ON DELETE SET NULL,
  status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Vehicle Inspection Records (Job Cards)
CREATE TABLE IF NOT EXISTS service_records (
  id TEXT PRIMARY KEY,
  service_center_id TEXT NOT NULL REFERENCES service_centers(id) ON DELETE CASCADE,
  vehicle_number TEXT NOT NULL,
  vehicle_type TEXT CHECK(vehicle_type IN ('car', 'bike')) NOT NULL,
  service_type TEXT, -- e.g. Wash, Teflon Coating, Ceramic Coating, PPF, Detailing
  customer_name TEXT,
  customer_phone TEXT,
  manager_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  manager_name TEXT,
  status TEXT CHECK(status IN ('checked_in', 'in_progress', 'checked_out')) DEFAULT 'checked_in',
  checkin_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  checkout_time DATETIME,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Inspection Photos (Stored in Cloudflare R2)
CREATE TABLE IF NOT EXISTS inspection_photos (
  id TEXT PRIMARY KEY,
  record_id TEXT NOT NULL REFERENCES service_records(id) ON DELETE CASCADE,
  stage TEXT CHECK(stage IN ('checkin', 'checkout')) NOT NULL,
  slot_key TEXT NOT NULL, -- e.g. 'front_left_door', 'front', 'dashboard', 'dicky', 'bike_front'
  slot_label TEXT NOT NULL,
  r2_key TEXT NOT NULL, -- Path in Cloudflare R2 bucket
  public_url TEXT NOT NULL, -- Public CDN or worker delivery URL
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_records_center ON service_records(service_center_id);
CREATE INDEX IF NOT EXISTS idx_records_status ON service_records(status);
CREATE INDEX IF NOT EXISTS idx_records_vnum ON service_records(vehicle_number);
CREATE INDEX IF NOT EXISTS idx_photos_record ON inspection_photos(record_id);
CREATE INDEX IF NOT EXISTS idx_photos_stage ON inspection_photos(record_id, stage);
CREATE INDEX IF NOT EXISTS idx_users_pin ON users(pin);
