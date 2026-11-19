"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_js_1 = require("../db/index.js");
const router = (0, express_1.Router)();
const DEFAULT_CHAPTERS = [
    'Bengaluru Central',
    'Bengaluru North',
    'Bengaluru South',
    'Hubballi - Dharwad',
    'Belagavi',
    'Mysuru',
    'Kalaburagi',
    'Vijayapura',
    'Davanagere',
    'Shivamogga',
    'Ballari',
    'Mangaluru & Coastal',
    'Bidar',
    'Raichur',
    'Bagalkote',
    'Gadag',
    'Haveri',
    'Chitradurga',
    'Tumakuru',
    'Mumbai & Maharashtra',
    'Pune',
    'Hyderabad & Telangana',
    'Delhi NCR',
    'Global / Overseas Chapter'
];
const MEMBERSHIP_TYPES = [
    'Visionary Life Member',
    'Executive Business Member',
    'Associate Member',
    'Young Lingayat Entrepreneur (YLE)',
    'Patron / Advisory Member'
];
// 1. GET application status (public)
router.get('/status', (req, res) => {
    try {
        const { query } = req.query;
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'Please provide an Application Reference Number, Membership ID, or registered Email.' });
        }
        const clean = query.trim();
        // Try finding by Reference No, Email, Mobile, or Membership ID
        const app = index_js_1.db.prepare(`
      SELECT 
        a.id as application_id,
        a.reference_no,
        a.status,
        a.full_name,
        a.email,
        a.mobile,
        a.company_name,
        a.designation,
        a.chapter,
        a.membership_type,
        a.rejection_reason,
        a.created_at,
        a.reviewed_at,
        m.id as member_id,
        m.membership_id,
        m.valid_until,
        m.approved_at,
        c.png_path as card_png_path,
        c.pdf_path as card_pdf_path
      FROM membership_applications a
      LEFT JOIN members m ON m.application_id = a.id
      LEFT JOIN generated_id_cards c ON c.member_id = m.id
      WHERE a.reference_no = ? 
         OR LOWER(a.email) = LOWER(?) 
         OR a.mobile = ?
         OR m.membership_id = ?
      ORDER BY a.id DESC LIMIT 1
    `).get(clean, clean, clean, clean);
        if (!app) {
            return res.status(404).json({ error: 'No application found with the provided details. Please verify your reference number or email address.' });
        }
        return res.json({ application: app });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// 2. GET chapters and membership options
router.get('/meta', (_req, res) => {
    return res.json({
        chapters: DEFAULT_CHAPTERS,
        membershipTypes: MEMBERSHIP_TYPES
    });
});
// 3. GET verify member credential via QR Code
router.get('/verify/:memberId', (req, res) => {
    try {
        const { memberId } = req.params;
        const member = index_js_1.db.prepare(`
      SELECT 
        m.membership_id,
        m.full_name,
        m.designation,
        m.company_name,
        m.chapter,
        m.membership_type,
        m.valid_until,
        m.status,
        m.approved_at,
        m.photo_url
      FROM members m
      WHERE m.membership_id = ?
    `).get(memberId);
        if (!member) {
            return res.status(404).json({ verified: false, error: 'Official member record not found.' });
        }
        return res.json({
            verified: true,
            member: {
                membership_id: member.membership_id,
                full_name: member.full_name,
                designation: member.designation,
                company_name: member.company_name,
                chapter: member.chapter,
                membership_type: member.membership_type,
                valid_until: member.valid_until,
                status: member.status,
                approved_at: member.approved_at,
                photo_url: member.photo_url
            }
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
exports.default = router;
