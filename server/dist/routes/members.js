"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_js_1 = require("../db/index.js");
const auth_js_1 = require("../middleware/auth.js");
const idCardService_js_1 = require("../services/idCardService.js");
const emailService_js_1 = require("../services/emailService.js");
const router = (0, express_1.Router)();
// 1. GET all approved members
router.get('/', auth_js_1.requireAdmin, (req, res) => {
    try {
        const { search, chapter, page = '1', limit = '50' } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.max(1, parseInt(limit, 10));
        const offset = (pageNum - 1) * limitNum;
        let query = `
      SELECT m.*, 
             a.reference_no,
             a.city,
             a.state,
             c.png_path as card_png_path,
             c.pdf_path as card_pdf_path,
             c.generated_at as card_generated_at,
             c.version as card_version
      FROM members m
      LEFT JOIN membership_applications a ON a.id = m.application_id
      LEFT JOIN generated_id_cards c ON c.member_id = m.id
      WHERE 1=1
    `;
        const params = [];
        if (chapter && chapter !== 'all') {
            query += ' AND m.chapter = ?';
            params.push(chapter);
        }
        if (search) {
            query += ` AND (
        m.full_name LIKE ? OR 
        m.membership_id LIKE ? OR 
        m.email LIKE ? OR 
        m.mobile LIKE ? OR 
        m.company_name LIKE ? OR 
        m.designation LIKE ?
      )`;
            const pattern = `%${search}%`;
            params.push(pattern, pattern, pattern, pattern, pattern, pattern);
        }
        query += ' ORDER BY m.id DESC LIMIT ? OFFSET ?';
        params.push(limitNum, offset);
        const members = index_js_1.db.prepare(query).all(...params);
        const total = index_js_1.db.prepare('SELECT COUNT(*) as c FROM members').get().c;
        return res.json({
            total,
            page: pageNum,
            limit: limitNum,
            members
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// 2. GET single member
router.get('/:id', auth_js_1.requireAdmin, (req, res) => {
    try {
        const member = index_js_1.db.prepare(`
      SELECT m.*, 
             a.reference_no,
             a.dob,
             a.gender,
             a.whatsapp,
             a.residential_address,
             a.business_category,
             a.city,
             a.state,
             a.business_address,
             a.website,
             c.png_path as card_png_path,
             c.pdf_path as card_pdf_path,
             c.generated_at as card_generated_at,
             c.version as card_version
      FROM members m
      LEFT JOIN membership_applications a ON a.id = m.application_id
      LEFT JOIN generated_id_cards c ON c.member_id = m.id
      WHERE m.id = ?
    `).get(req.params.id);
        if (!member) {
            return res.status(404).json({ error: 'Member not found.' });
        }
        const emailLogs = index_js_1.db.prepare(`
      SELECT * FROM email_logs WHERE member_id = ? ORDER BY id DESC
    `).all(req.params.id);
        return res.json({ member, emailLogs });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// 3. POST regenerate card
router.post('/:id/regenerate-card', auth_js_1.requireAdmin, async (req, res) => {
    try {
        const member = index_js_1.db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
        if (!member) {
            return res.status(404).json({ error: 'Member not found.' });
        }
        const cardFiles = await (0, idCardService_js_1.generateIdCardFiles)({
            id: member.id,
            membership_id: member.membership_id,
            full_name: member.full_name,
            designation: member.designation,
            company_name: member.company_name,
            chapter: member.chapter,
            membership_type: member.membership_type,
            photo_url: member.photo_url,
            valid_until: member.valid_until
        });
        return res.json({
            success: true,
            message: 'ID Card regenerated successfully.',
            cardFiles
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// 4. POST resend card email
router.post('/:id/resend-card', auth_js_1.requireAdmin, async (req, res) => {
    try {
        const member = index_js_1.db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
        if (!member) {
            return res.status(404).json({ error: 'Member not found.' });
        }
        // Ensure generated card exists or generate fresh
        const cardRecord = index_js_1.db.prepare('SELECT * FROM generated_id_cards WHERE member_id = ?').get(member.id);
        let cardFiles;
        if (cardRecord) {
            cardFiles = {
                pngPath: cardRecord.png_path,
                pdfPath: cardRecord.pdf_path
            };
        }
        else {
            cardFiles = await (0, idCardService_js_1.generateIdCardFiles)({
                id: member.id,
                membership_id: member.membership_id,
                full_name: member.full_name,
                designation: member.designation,
                company_name: member.company_name,
                chapter: member.chapter,
                membership_type: member.membership_type,
                photo_url: member.photo_url,
                valid_until: member.valid_until
            });
        }
        const emailResult = await (0, emailService_js_1.sendApprovalAndCardEmail)({
            id: member.id,
            application_id: member.application_id,
            membership_id: member.membership_id,
            full_name: member.full_name,
            email: member.email,
            chapter: member.chapter,
            designation: member.designation,
            membership_type: member.membership_type
        }, cardFiles);
        return res.json({
            success: true,
            message: `ID Card resent to ${member.email}.`,
            emailResult
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
exports.default = router;
