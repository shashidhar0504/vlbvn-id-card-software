-- VLPN Community Database Schema

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS membership_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference_no TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
  rejection_reason TEXT,
  reviewed_at DATETIME,
  reviewed_by INTEGER REFERENCES admins(id),
  full_name TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  dob TEXT,
  gender TEXT,
  mobile TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  residential_address TEXT NOT NULL,
  company_name TEXT NOT NULL,
  business_category TEXT NOT NULL,
  designation TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  business_address TEXT,
  website TEXT,
  membership_type TEXT NOT NULL,
  chapter TEXT NOT NULL,
  requested_role TEXT,
  additional_info TEXT,
  declaration_confirmed INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  membership_id TEXT UNIQUE NOT NULL,
  application_id INTEGER UNIQUE NOT NULL REFERENCES membership_applications(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL,
  designation TEXT NOT NULL,
  company_name TEXT NOT NULL,
  chapter TEXT NOT NULL,
  membership_type TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  valid_until TEXT,
  status TEXT DEFAULT 'Active',
  approved_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS id_card_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  is_active INTEGER DEFAULT 0,
  card_width INTEGER NOT NULL DEFAULT 1012,
  card_height INTEGER NOT NULL DEFAULT 638,
  orientation TEXT DEFAULT 'landscape',
  front_background_url TEXT NOT NULL,
  back_background_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS id_card_field_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id INTEGER NOT NULL REFERENCES id_card_templates(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL, -- 'name', 'member_id', 'designation', 'company', 'chapter', 'photo', 'validity', 'qr_code'
  label TEXT NOT NULL,
  x REAL NOT NULL,
  y REAL NOT NULL,
  width REAL NOT NULL,
  height REAL NOT NULL,
  font_size INTEGER DEFAULT 24,
  font_family TEXT DEFAULT 'Inter',
  font_weight TEXT DEFAULT 'bold',
  text_color TEXT DEFAULT '#1A1816',
  text_align TEXT DEFAULT 'left',
  is_visible INTEGER DEFAULT 1,
  border_radius INTEGER DEFAULT 0,
  border_color TEXT DEFAULT '#D4AF37',
  border_width INTEGER DEFAULT 0,
  side TEXT DEFAULT 'front'
);

CREATE TABLE IF NOT EXISTS generated_id_cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL REFERENCES members(id),
  template_id INTEGER NOT NULL REFERENCES id_card_templates(id),
  png_path TEXT NOT NULL,
  pdf_path TEXT NOT NULL,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  version INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS email_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  email_type TEXT NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  application_id INTEGER REFERENCES membership_applications(id),
  member_id INTEGER REFERENCES members(id)
);

CREATE TABLE IF NOT EXISTS system_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indices for rapid lookup & unique validations
CREATE INDEX IF NOT EXISTS idx_apps_ref ON membership_applications(reference_no);
CREATE INDEX IF NOT EXISTS idx_apps_email ON membership_applications(email);
CREATE INDEX IF NOT EXISTS idx_apps_mobile ON membership_applications(mobile);
CREATE INDEX IF NOT EXISTS idx_apps_status ON membership_applications(status);
CREATE INDEX IF NOT EXISTS idx_members_mid ON members(membership_id);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_fields_template ON id_card_field_configs(template_id);
