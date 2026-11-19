import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import os from 'os';
import bcrypt from 'bcryptjs';
import { ensureDefaultTemplateFile } from '../services/templateGenerator.js';

const isVercel = !!process.env.VERCEL;
const dbPath = isVercel
  ? path.join(os.tmpdir(), 'vlpn.db')
  : path.resolve(process.cwd(), 'vlpn.db');
export const db = new DatabaseSync(dbPath);

const DEFAULT_SCHEMA_SQL = `
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
  status TEXT NOT NULL DEFAULT 'Pending',
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
  field_key TEXT NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_apps_ref ON membership_applications(reference_no);
CREATE INDEX IF NOT EXISTS idx_apps_email ON membership_applications(email);
CREATE INDEX IF NOT EXISTS idx_apps_mobile ON membership_applications(mobile);
CREATE INDEX IF NOT EXISTS idx_apps_status ON membership_applications(status);
CREATE INDEX IF NOT EXISTS idx_members_mid ON members(membership_id);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_fields_template ON id_card_field_configs(template_id);
`;

export async function initDatabase() {
  const candidateSchemaPaths = [
    path.resolve(process.cwd(), 'src', 'db', 'schema.sql'),
    path.resolve(process.cwd(), 'dist', 'db', 'schema.sql'),
    path.resolve(process.cwd(), 'schema.sql'),
    path.resolve(process.cwd(), 'server', 'src', 'db', 'schema.sql'),
    path.resolve(process.cwd(), 'server', 'dist', 'db', 'schema.sql')
  ];
  let schema = DEFAULT_SCHEMA_SQL;
  for (const p of candidateSchemaPaths) {
    if (fs.existsSync(p)) {
      try {
        schema = fs.readFileSync(p, 'utf8');
        break;
      } catch {}
    }
  }
  db.exec(schema);

  // 1. Seed Default Admin
  const existingAdmin = db.prepare('SELECT id FROM admins WHERE email = ?').get('admin@vlpn.org') as { id: number } | undefined;
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    db.prepare(`
      INSERT INTO admins (email, password_hash, name, role)
      VALUES (?, ?, ?, ?)
    `).run('admin@vlpn.org', passwordHash, 'VLBVN Administrator', 'admin');
    console.log('✔ Initialized default admin: admin@vlpn.org / admin123');
  }

  // 2. Ensure template image file exists with exact official logo & light theme
  await ensureDefaultTemplateFile();
  const templateWebPath = '/uploads/templates/vlbvn_light_template.png';

  // 3. Update or Seed Default ID Card Template
  const existingTemplate = db.prepare('SELECT id FROM id_card_templates WHERE is_active = 1').get() as { id: number } | undefined;
  let templateId: number | bigint = 0;

  if (!existingTemplate) {
    const res = db.prepare(`
      INSERT INTO id_card_templates (name, description, is_active, card_width, card_height, orientation, front_background_url)
      VALUES (?, ?, 1, 1012, 638, 'landscape', ?)
    `).run('VLBVN Minimalist Light Gold (Landscape)', 'Clean light color theme with official VLBVN emblem, gold borders and security watermark', templateWebPath);
    templateId = res.lastInsertRowid;
  } else {
    // Update existing active template to use the new clean light background
    db.prepare(`
      UPDATE id_card_templates 
      SET name = 'VLBVN Minimalist Light Gold (Landscape)',
          description = 'Clean light color theme with official VLBVN emblem, gold borders and security watermark',
          front_background_url = ?
      WHERE id = ?
    `).run(templateWebPath, existingTemplate.id);
    templateId = existingTemplate.id;

    // Remove existing field configs to re-apply light theme typography colors
    db.prepare('DELETE FROM id_card_field_configs WHERE template_id = ?').run(templateId);
  }

  // Insert Clean Light Field Configurations
  const insertField = db.prepare(`
    INSERT INTO id_card_field_configs 
    (template_id, field_key, label, x, y, width, height, font_size, font_family, font_weight, text_color, text_align, is_visible, border_radius, border_color, border_width, side)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const fields = [
    {
      field_key: 'photo',
      label: 'Profile Photograph',
      x: 56,
      y: 160,
      width: 182,
      height: 222,
      font_size: 14,
      font_family: 'Inter',
      font_weight: 'normal',
      text_color: '#0F172A',
      text_align: 'center',
      is_visible: 1,
      border_radius: 8,
      border_color: '#D4AF37',
      border_width: 2,
      side: 'front'
    },
    {
      field_key: 'name',
      label: 'Member Full Name',
      x: 280,
      y: 184,
      width: 520,
      height: 36,
      font_size: 26,
      font_family: 'Inter',
      font_weight: 'bold',
      text_color: '#0F172A', // Crisp dark slate for clean light background
      text_align: 'left',
      is_visible: 1,
      border_radius: 0,
      border_color: '#D4AF37',
      border_width: 0,
      side: 'front'
    },
    {
      field_key: 'member_id',
      label: 'Membership ID',
      x: 280,
      y: 260,
      width: 310,
      height: 30,
      font_size: 21,
      font_family: 'Inter',
      font_weight: 'bold',
      text_color: '#B8860B', // Rich metallic gold
      text_align: 'left',
      is_visible: 1,
      border_radius: 0,
      border_color: '#D4AF37',
      border_width: 0,
      side: 'front'
    },
    {
      field_key: 'chapter',
      label: 'Chapter / Region',
      x: 610,
      y: 260,
      width: 350,
      height: 30,
      font_size: 19,
      font_family: 'Inter',
      font_weight: 'bold',
      text_color: '#0F172A', // Clean dark text
      text_align: 'left',
      is_visible: 1,
      border_radius: 0,
      border_color: '#D4AF37',
      border_width: 0,
      side: 'front'
    },
    {
      field_key: 'designation',
      label: 'Designation & Company',
      x: 280,
      y: 338,
      width: 520,
      height: 32,
      font_size: 20,
      font_family: 'Inter',
      font_weight: 'bold',
      text_color: '#1E293B',
      text_align: 'left',
      is_visible: 1,
      border_radius: 0,
      border_color: '#D4AF37',
      border_width: 0,
      side: 'front'
    },
    {
      field_key: 'company',
      label: 'Company Name',
      x: 280,
      y: 364,
      width: 500,
      height: 24,
      font_size: 16,
      font_family: 'Inter',
      font_weight: 'medium',
      text_color: '#475569',
      text_align: 'left',
      is_visible: 0,
      border_radius: 0,
      border_color: '#D4AF37',
      border_width: 0,
      side: 'front'
    },
    {
      field_key: 'membership_type',
      label: 'Membership Type',
      x: 280,
      y: 418,
      width: 320,
      height: 28,
      font_size: 18,
      font_family: 'Inter',
      font_weight: 'bold',
      text_color: '#996515', // Warm rich gold/amber
      text_align: 'left',
      is_visible: 1,
      border_radius: 0,
      border_color: '#D4AF37',
      border_width: 0,
      side: 'front'
    },
    {
      field_key: 'validity',
      label: 'Valid Thru',
      x: 610,
      y: 418,
      width: 180,
      height: 28,
      font_size: 18,
      font_family: 'Inter',
      font_weight: 'bold',
      text_color: '#0F172A',
      text_align: 'left',
      is_visible: 1,
      border_radius: 0,
      border_color: '#D4AF37',
      border_width: 0,
      side: 'front'
    },
    {
      field_key: 'qr_code',
      label: 'QR Code Verification',
      x: 830,
      y: 415,
      width: 120,
      height: 120,
      font_size: 12,
      font_family: 'Inter',
      font_weight: 'normal',
      text_color: '#000000',
      text_align: 'center',
      is_visible: 1,
      border_radius: 6,
      border_color: '#D4AF37',
      border_width: 1,
      side: 'front'
    }
  ];

  for (const f of fields) {
    insertField.run(
      templateId,
      f.field_key,
      f.label,
      f.x,
      f.y,
      f.width,
      f.height,
      f.font_size,
      f.font_family,
      f.font_weight,
      f.text_color,
      f.text_align,
      f.is_visible,
      f.border_radius,
      f.border_color,
      f.border_width,
      f.side
    );
  }

  // 4. Update / Seed VLBVN System Settings
  const defaultSettings: Record<string, string> = {
    community_name: 'VLBVN Community',
    community_full_title: 'Veerashaiva Lingayat Business Visionary Network',
    contact_email: 'info@vlbvn.org',
    contact_phone: '+91 98800 12345',
    admin_notification_email: 'admin@vlpn.org',
    member_id_prefix: 'VLBVN-2026-',
    card_validity_years: '3',
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_pass: '',
    smtp_secure: 'false',
    smtp_from: 'VLBVN Community <membership@vlbvn.org>'
  };

  const updateSetting = db.prepare(`
    INSERT INTO system_settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO NOTHING
  `);

  for (const [key, value] of Object.entries(defaultSettings)) {
    updateSetting.run(key, value);
  }

  console.log('✔ VLBVN Database initialized & seeded with clean light theme template.');
}
