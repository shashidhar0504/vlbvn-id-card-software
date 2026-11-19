"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_js_1 = require("../db/index.js");
const auth_js_1 = require("../middleware/auth.js");
const upload_js_1 = require("../middleware/upload.js");
const idCardService_js_1 = require("../services/idCardService.js");
const router = (0, express_1.Router)();
// Sample member data for live visual designer previews
const SAMPLE_MEMBER = {
    membership_id: 'VLPN-2026-0088',
    full_name: 'Shri Basavaraj S. Patil',
    designation: 'Managing Director & Founder',
    company_name: 'Patil Global Infrastructure Ltd.',
    chapter: 'Bengaluru Central',
    membership_type: 'Visionary Life Member',
    photo_url: '', // will fallback to elegant gold avatar
    valid_until: 'Life Member'
};
// 1. GET all templates
router.get('/', auth_js_1.requireAdmin, (req, res) => {
    try {
        const templates = index_js_1.db.prepare('SELECT * FROM id_card_templates ORDER BY is_active DESC, id DESC').all();
        return res.json({ templates });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// 2. GET active template with all its fields
router.get('/active', auth_js_1.requireAdmin, (req, res) => {
    try {
        let template = index_js_1.db.prepare('SELECT * FROM id_card_templates WHERE is_active = 1').get();
        if (!template) {
            template = index_js_1.db.prepare('SELECT * FROM id_card_templates ORDER BY id DESC LIMIT 1').get();
        }
        if (!template) {
            return res.status(404).json({ error: 'No ID card template found.' });
        }
        const fields = index_js_1.db.prepare('SELECT * FROM id_card_field_configs WHERE template_id = ?').all(template.id);
        return res.json({ template, fields });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// 3. GET template by ID
router.get('/:id', auth_js_1.requireAdmin, (req, res) => {
    try {
        const template = index_js_1.db.prepare('SELECT * FROM id_card_templates WHERE id = ?').get(req.params.id);
        if (!template) {
            return res.status(404).json({ error: 'Template not found.' });
        }
        const fields = index_js_1.db.prepare('SELECT * FROM id_card_field_configs WHERE template_id = ?').all(template.id);
        return res.json({ template, fields });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// 4. POST create new template with background upload
router.post('/', auth_js_1.requireAdmin, upload_js_1.uploadTemplate.single('background'), (req, res) => {
    try {
        const { name, description, card_width, card_height, orientation } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Template name is required.' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'Background image is required.' });
        }
        const backgroundUrl = `/uploads/templates/${req.file.filename}`;
        const width = parseInt(card_width, 10) || 1012;
        const height = parseInt(card_height, 10) || 638;
        const orient = orientation || (width > height ? 'landscape' : 'portrait');
        const result = index_js_1.db.prepare(`
      INSERT INTO id_card_templates (name, description, is_active, card_width, card_height, orientation, front_background_url)
      VALUES (?, ?, 0, ?, ?, ?, ?)
    `).run(name, description || null, width, height, orient, backgroundUrl);
        const newTemplateId = Number(result.lastInsertRowid);
        // Seed default standard field configuration positions
        const defaultFields = [
            { key: 'photo', label: 'Profile Photograph', x: 60, y: 160, w: 180, h: 220, fs: 14, ff: 'Inter', fw: 'normal', col: '#FFFFFF', align: 'center', r: 10, bc: '#D4AF37', bw: 2 },
            { key: 'name', label: 'Member Full Name', x: 280, y: 185, w: 500, h: 36, fs: 26, ff: 'Inter', fw: 'bold', col: '#FFFFFF', align: 'left', r: 0, bc: '#D4AF37', bw: 0 },
            { key: 'member_id', label: 'Membership ID', x: 280, y: 260, w: 300, h: 30, fs: 22, ff: 'Inter', fw: 'bold', col: '#D4AF37', align: 'left', r: 0, bc: '#D4AF37', bw: 0 },
            { key: 'chapter', label: 'Chapter / Region', x: 620, y: 260, w: 320, h: 30, fs: 20, ff: 'Inter', fw: 'bold', col: '#F8FAFC', align: 'left', r: 0, bc: '#D4AF37', bw: 0 },
            { key: 'designation', label: 'Designation & Company', x: 280, y: 338, w: 500, h: 32, fs: 20, ff: 'Inter', fw: 'bold', col: '#F1F5F9', align: 'left', r: 0, bc: '#D4AF37', bw: 0 },
            { key: 'company', label: 'Company Name', x: 280, y: 364, w: 500, h: 24, fs: 16, ff: 'Inter', fw: 'medium', col: '#CBD5E1', align: 'left', r: 0, bc: '#D4AF37', bw: 0 },
            { key: 'membership_type', label: 'Membership Type', x: 280, y: 422, w: 300, h: 28, fs: 18, ff: 'Inter', fw: 'bold', col: '#D4AF37', align: 'left', r: 0, bc: '#D4AF37', bw: 0 },
            { key: 'validity', label: 'Valid Thru', x: 620, y: 422, w: 180, h: 28, fs: 18, ff: 'Inter', fw: 'bold', col: '#F8FAFC', align: 'left', r: 0, bc: '#D4AF37', bw: 0 },
            { key: 'qr_code', label: 'QR Code Verification', x: 830, y: 420, w: 120, h: 120, fs: 12, ff: 'Inter', fw: 'normal', col: '#000000', align: 'center', r: 6, bc: '#D4AF37', bw: 1 }
        ];
        const insertField = index_js_1.db.prepare(`
      INSERT INTO id_card_field_configs 
      (template_id, field_key, label, x, y, width, height, font_size, font_family, font_weight, text_color, text_align, is_visible, border_radius, border_color, border_width, side)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, 'front')
    `);
        for (const f of defaultFields) {
            insertField.run(newTemplateId, f.key, f.label, f.x, f.y, f.w, f.h, f.fs, f.ff, f.fw, f.col, f.align, f.r, f.bc, f.bw);
        }
        return res.status(201).json({
            success: true,
            id: newTemplateId,
            message: 'Template created successfully.'
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// 5. PUT update template coordinates & styling
router.put('/:id', auth_js_1.requireAdmin, (req, res) => {
    try {
        const templateId = parseInt(req.params.id, 10);
        const { name, description, card_width, card_height, orientation, fields } = req.body;
        const existing = index_js_1.db.prepare('SELECT id FROM id_card_templates WHERE id = ?').get(templateId);
        if (!existing) {
            return res.status(404).json({ error: 'Template not found.' });
        }
        // Update template header info
        if (name) {
            index_js_1.db.prepare(`
        UPDATE id_card_templates 
        SET name = ?, description = ?, card_width = ?, card_height = ?, orientation = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(name, description || null, card_width || 1012, card_height || 638, orientation || 'landscape', templateId);
        }
        // Update field configs
        if (Array.isArray(fields)) {
            const updateStmt = index_js_1.db.prepare(`
        UPDATE id_card_field_configs 
        SET x = ?, y = ?, width = ?, height = ?, font_size = ?, font_family = ?, font_weight = ?,
            text_color = ?, text_align = ?, is_visible = ?, border_radius = ?, border_color = ?, border_width = ?
        WHERE id = ? AND template_id = ?
      `);
            for (const f of fields) {
                if (f.id) {
                    updateStmt.run(f.x, f.y, f.width, f.height, f.font_size || 20, f.font_family || 'Inter', f.font_weight || 'normal', f.text_color || '#FFFFFF', f.text_align || 'left', f.is_visible !== undefined ? (f.is_visible ? 1 : 0) : 1, f.border_radius || 0, f.border_color || '#D4AF37', f.border_width || 0, f.id, templateId);
                }
            }
        }
        return res.json({ success: true, message: 'Template configurations saved successfully.' });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// 6. POST set active template
router.post('/:id/activate', auth_js_1.requireAdmin, (req, res) => {
    try {
        const templateId = parseInt(req.params.id, 10);
        index_js_1.db.prepare('UPDATE id_card_templates SET is_active = 0').run();
        index_js_1.db.prepare('UPDATE id_card_templates SET is_active = 1 WHERE id = ?').run(templateId);
        return res.json({ success: true, message: 'Template activated as system default.' });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// 7. POST generate live preview with custom field positions (used by Designer live canvas)
router.post('/:id/preview', auth_js_1.requireAdmin, async (req, res) => {
    try {
        const templateId = parseInt(req.params.id, 10);
        const { fields, memberSample } = req.body;
        const template = index_js_1.db.prepare('SELECT * FROM id_card_templates WHERE id = ?').get(templateId);
        if (!template) {
            return res.status(404).json({ error: 'Template not found.' });
        }
        const fieldConfigs = fields && Array.isArray(fields)
            ? fields
            : index_js_1.db.prepare('SELECT * FROM id_card_field_configs WHERE template_id = ?').all(templateId);
        const memberData = memberSample || SAMPLE_MEMBER;
        const canvas = await (0, idCardService_js_1.renderCardCanvas)(memberData, template, fieldConfigs);
        const dataUrl = canvas.toDataURL('image/png');
        return res.json({ previewDataUrl: dataUrl });
    }
    catch (err) {
        console.error('Preview error:', err);
        return res.status(500).json({ error: err.message });
    }
});
exports.default = router;
