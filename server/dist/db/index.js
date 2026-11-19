"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initDatabase = initDatabase;
const node_sqlite_1 = require("node:sqlite");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const templateGenerator_js_1 = require("../services/templateGenerator.js");
const isVercel = !!process.env.VERCEL;
const dbPath = isVercel
    ? path_1.default.join(os_1.default.tmpdir(), 'vlpn.db')
    : path_1.default.resolve(process.cwd(), 'vlpn.db');
exports.db = new node_sqlite_1.DatabaseSync(dbPath);
async function initDatabase() {
    const candidateSchemaPaths = [
        path_1.default.resolve(process.cwd(), 'src', 'db', 'schema.sql'),
        path_1.default.resolve(process.cwd(), 'dist', 'db', 'schema.sql'),
        path_1.default.resolve(process.cwd(), 'schema.sql'),
        path_1.default.resolve(process.cwd(), 'server', 'src', 'db', 'schema.sql'),
        path_1.default.resolve(process.cwd(), 'server', 'dist', 'db', 'schema.sql')
    ];
    const schemaPath = candidateSchemaPaths.find(p => fs_1.default.existsSync(p)) || candidateSchemaPaths[0];
    const schema = fs_1.default.readFileSync(schemaPath, 'utf8');
    exports.db.exec(schema);
    // 1. Seed Default Admin
    const existingAdmin = exports.db.prepare('SELECT id FROM admins WHERE email = ?').get('admin@vlpn.org');
    if (!existingAdmin) {
        const passwordHash = await bcryptjs_1.default.hash('admin123', 10);
        exports.db.prepare(`
      INSERT INTO admins (email, password_hash, name, role)
      VALUES (?, ?, ?, ?)
    `).run('admin@vlpn.org', passwordHash, 'VLBVN Administrator', 'admin');
        console.log('✔ Initialized default admin: admin@vlpn.org / admin123');
    }
    // 2. Ensure template image file exists with exact official logo & light theme
    await (0, templateGenerator_js_1.ensureDefaultTemplateFile)();
    const templateWebPath = '/uploads/templates/vlbvn_light_template.png';
    // 3. Update or Seed Default ID Card Template
    const existingTemplate = exports.db.prepare('SELECT id FROM id_card_templates WHERE is_active = 1').get();
    let templateId = 0;
    if (!existingTemplate) {
        const res = exports.db.prepare(`
      INSERT INTO id_card_templates (name, description, is_active, card_width, card_height, orientation, front_background_url)
      VALUES (?, ?, 1, 1012, 638, 'landscape', ?)
    `).run('VLBVN Minimalist Light Gold (Landscape)', 'Clean light color theme with official VLBVN emblem, gold borders and security watermark', templateWebPath);
        templateId = res.lastInsertRowid;
    }
    else {
        // Update existing active template to use the new clean light background
        exports.db.prepare(`
      UPDATE id_card_templates 
      SET name = 'VLBVN Minimalist Light Gold (Landscape)',
          description = 'Clean light color theme with official VLBVN emblem, gold borders and security watermark',
          front_background_url = ?
      WHERE id = ?
    `).run(templateWebPath, existingTemplate.id);
        templateId = existingTemplate.id;
        // Remove existing field configs to re-apply light theme typography colors
        exports.db.prepare('DELETE FROM id_card_field_configs WHERE template_id = ?').run(templateId);
    }
    // Insert Clean Light Field Configurations
    const insertField = exports.db.prepare(`
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
        insertField.run(templateId, f.field_key, f.label, f.x, f.y, f.width, f.height, f.font_size, f.font_family, f.font_weight, f.text_color, f.text_align, f.is_visible, f.border_radius, f.border_color, f.border_width, f.side);
    }
    // 4. Update / Seed VLBVN System Settings
    const defaultSettings = {
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
    const updateSetting = exports.db.prepare(`
    INSERT INTO system_settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO NOTHING
  `);
    for (const [key, value] of Object.entries(defaultSettings)) {
        updateSetting.run(key, value);
    }
    console.log('✔ VLBVN Database initialized & seeded with clean light theme template.');
}
