"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_js_1 = require("../db/index.js");
const upload_js_1 = require("../middleware/upload.js");
const auth_js_1 = require("../middleware/auth.js");
const idCardService_js_1 = require("../services/idCardService.js");
const emailService_js_1 = require("../services/emailService.js");
const router = (0, express_1.Router)();
// Generate unique Reference No: VLBVN-APP-2026-0001
function generateReferenceNo() {
    const currentYear = new Date().getFullYear();
    const countRow = index_js_1.db.prepare('SELECT COUNT(*) as count FROM membership_applications').get();
    const nextSeq = (countRow.count + 1).toString().padStart(4, '0');
    const randomSuffix = Math.floor(100 + Math.random() * 900); // 3-digit randomness to avoid collision
    return `VLBVN-APP-${currentYear}-${nextSeq}${randomSuffix}`;
}
// Generate unique Membership ID: VLBVN-2026-0001
function generateMembershipId() {
    const prefixRow = index_js_1.db.prepare("SELECT value FROM system_settings WHERE key = 'member_id_prefix'").get();
    const prefix = prefixRow?.value || `VLBVN-${new Date().getFullYear()}-`;
    const countRow = index_js_1.db.prepare('SELECT COUNT(*) as count FROM members').get();
    const nextSeq = (countRow.count + 1).toString().padStart(4, '0');
    let candidate = `${prefix}${nextSeq}`;
    // Ensure strict uniqueness
    let counter = countRow.count + 1;
    while (index_js_1.db.prepare('SELECT id FROM members WHERE membership_id = ?').get(candidate)) {
        counter++;
        candidate = `${prefix}${counter.toString().padStart(4, '0')}`;
    }
    return candidate;
}
// 1. PUBLIC: Submit Membership Application
router.post('/', upload_js_1.uploadPhoto.single('photo'), async (req, res) => {
    try {
        const { fullName, dob, gender, mobile, whatsapp, email, residentialAddress, companyName, businessCategory, designation, city, state, businessAddress, website, membershipType, chapter, requestedRole, additionalInfo, declarationConfirmed } = req.body;
        // Required fields validation
        if (!fullName || !mobile || !email || !residentialAddress || !companyName || !businessCategory || !designation || !city || !state || !membershipType || !chapter) {
            return res.status(400).json({ error: 'Please fill in all required fields.' });
        }
        if (!declarationConfirmed || declarationConfirmed === 'false') {
            return res.status(400).json({ error: 'You must confirm the declaration to proceed.' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'Profile photograph is required.' });
        }
        const cleanEmail = email.trim().toLowerCase();
        const cleanMobile = mobile.trim();
        // Check duplicate applications
        const existing = index_js_1.db.prepare(`
      SELECT id, reference_no, status FROM membership_applications 
      WHERE (email = ? OR mobile = ?) AND status IN ('Pending', 'Approved')
    `).get(cleanEmail, cleanMobile);
        if (existing) {
            return res.status(409).json({
                error: `An application with this email or mobile number already exists (Reference: ${existing.reference_no}, Status: ${existing.status}). Please check your status instead of re-registering.`,
                reference_no: existing.reference_no,
                status: existing.status
            });
        }
        const photoUrl = `/uploads/photos/${req.file.filename}`;
        const referenceNo = generateReferenceNo();
        const insertStmt = index_js_1.db.prepare(`
      INSERT INTO membership_applications (
        reference_no, status, full_name, photo_url, dob, gender, mobile, whatsapp, email,
        residential_address, company_name, business_category, designation, city, state,
        business_address, website, membership_type, chapter, requested_role, additional_info, declaration_confirmed
      ) VALUES (
        ?, 'Pending', ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, 1
      )
    `);
        const result = insertStmt.run(referenceNo, fullName.trim(), photoUrl, dob || null, gender || null, cleanMobile, (whatsapp || cleanMobile).trim(), cleanEmail, residentialAddress.trim(), companyName.trim(), businessCategory.trim(), designation.trim(), city.trim(), state.trim(), businessAddress ? businessAddress.trim() : null, website ? website.trim() : null, membershipType.trim(), chapter.trim(), requestedRole ? requestedRole.trim() : null, additionalInfo ? additionalInfo.trim() : null);
        const newAppId = Number(result.lastInsertRowid);
        // Send confirmation email asynchronously (never crash the application submission)
        (0, emailService_js_1.sendApplicationReceivedEmail)({
            id: newAppId,
            reference_no: referenceNo,
            full_name: fullName.trim(),
            email: cleanEmail,
            chapter: chapter.trim(),
            designation: designation.trim(),
            company_name: companyName.trim()
        }).catch(err => console.error('Error dispatching submission email:', err));
        return res.status(201).json({
            success: true,
            reference_no: referenceNo,
            id: newAppId,
            message: 'Application submitted successfully. A confirmation email has been sent.'
        });
    }
    catch (err) {
        console.error('Error creating application:', err);
        return res.status(500).json({ error: err.message || 'Internal server error while submitting application.' });
    }
});
// 2. ADMIN: List all applications with counts & filters
router.get('/', auth_js_1.requireAdmin, (req, res) => {
    try {
        const { status, search, chapter, page = '1', limit = '50' } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.max(1, parseInt(limit, 10));
        const offset = (pageNum - 1) * limitNum;
        // Get statistics counts
        const totalCount = index_js_1.db.prepare('SELECT COUNT(*) as c FROM membership_applications').get().c;
        const pendingCount = index_js_1.db.prepare("SELECT COUNT(*) as c FROM membership_applications WHERE status = 'Pending'").get().c;
        const approvedCount = index_js_1.db.prepare("SELECT COUNT(*) as c FROM membership_applications WHERE status = 'Approved'").get().c;
        const rejectedCount = index_js_1.db.prepare("SELECT COUNT(*) as c FROM membership_applications WHERE status = 'Rejected'").get().c;
        let query = `
      SELECT a.*, 
        m.membership_id,
        c.png_path as card_png_path,
        c.pdf_path as card_pdf_path
      FROM membership_applications a
      LEFT JOIN members m ON m.application_id = a.id
      LEFT JOIN generated_id_cards c ON c.member_id = m.id
      WHERE 1=1
    `;
        const params = [];
        if (status && status !== 'all') {
            query += ' AND a.status = ?';
            params.push(status);
        }
        if (chapter && chapter !== 'all') {
            query += ' AND a.chapter = ?';
            params.push(chapter);
        }
        if (search) {
            query += ` AND (
        a.full_name LIKE ? OR 
        a.email LIKE ? OR 
        a.mobile LIKE ? OR 
        a.reference_no LIKE ? OR 
        a.company_name LIKE ? OR 
        a.designation LIKE ? OR
        m.membership_id LIKE ?
      )`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
        }
        query += ' ORDER BY a.id DESC LIMIT ? OFFSET ?';
        params.push(limitNum, offset);
        const applications = index_js_1.db.prepare(query).all(...params);
        return res.json({
            counts: {
                total: totalCount,
                pending: pendingCount,
                approved: approvedCount,
                rejected: rejectedCount
            },
            page: pageNum,
            limit: limitNum,
            applications
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// 3. ADMIN: Get single application details
router.get('/:id', auth_js_1.requireAdmin, (req, res) => {
    try {
        const app = index_js_1.db.prepare(`
      SELECT a.*, 
        m.id as member_table_id,
        m.membership_id,
        m.approved_at,
        c.png_path as card_png_path,
        c.pdf_path as card_pdf_path,
        admin.name as reviewer_name
      FROM membership_applications a
      LEFT JOIN members m ON m.application_id = a.id
      LEFT JOIN generated_id_cards c ON c.member_id = m.id
      LEFT JOIN admins admin ON admin.id = a.reviewed_by
      WHERE a.id = ?
    `).get(req.params.id);
        if (!app) {
            return res.status(404).json({ error: 'Application not found.' });
        }
        const emailLogs = index_js_1.db.prepare(`
      SELECT * FROM email_logs WHERE application_id = ? ORDER BY id DESC
    `).all(req.params.id);
        return res.json({ application: app, emailLogs });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// 4. ADMIN: Approve application
router.post('/:id/approve', auth_js_1.requireAdmin, async (req, res) => {
    try {
        const appId = parseInt(req.params.id, 10);
        const app = index_js_1.db.prepare('SELECT * FROM membership_applications WHERE id = ?').get(appId);
        if (!app) {
            return res.status(404).json({ error: 'Application not found.' });
        }
        // Determine or retrieve Membership ID
        let member = index_js_1.db.prepare('SELECT * FROM members WHERE application_id = ?').get(appId);
        let membershipId = member ? member.membership_id : generateMembershipId();
        const validityYearsRow = index_js_1.db.prepare("SELECT value FROM system_settings WHERE key = 'card_validity_years'").get();
        const validityYears = parseInt(validityYearsRow?.value || '3', 10);
        const validUntilDate = new Date();
        validUntilDate.setFullYear(validUntilDate.getFullYear() + validityYears);
        const validUntilStr = validUntilDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        let memberId;
        if (member) {
            // Re-approval update
            index_js_1.db.prepare(`
        UPDATE members 
        SET status = 'Active', approved_at = CURRENT_TIMESTAMP, valid_until = ?
        WHERE id = ?
      `).run(validUntilStr, member.id);
            memberId = member.id;
        }
        else {
            const insMember = index_js_1.db.prepare(`
        INSERT INTO members (
          membership_id, application_id, full_name, email, mobile,
          designation, company_name, chapter, membership_type, photo_url, valid_until, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')
      `).run(membershipId, appId, app.full_name, app.email, app.mobile, app.designation, app.company_name, app.chapter, app.membership_type, app.photo_url, validUntilStr);
            memberId = Number(insMember.lastInsertRowid);
        }
        // Update application status
        index_js_1.db.prepare(`
      UPDATE membership_applications 
      SET status = 'Approved', reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ?
      WHERE id = ?
    `).run(req.admin.id, appId);
        // Generate personalized ID Card (PNG + PDF)
        const cardFiles = await (0, idCardService_js_1.generateIdCardFiles)({
            id: memberId,
            membership_id: membershipId,
            full_name: app.full_name,
            designation: app.designation,
            company_name: app.company_name,
            chapter: app.chapter,
            membership_type: app.membership_type,
            photo_url: app.photo_url,
            valid_until: validUntilStr
        });
        // Automatically send Email with ID Card attachment
        const emailResult = await (0, emailService_js_1.sendApprovalAndCardEmail)({
            id: memberId,
            application_id: appId,
            membership_id: membershipId,
            full_name: app.full_name,
            email: app.email,
            chapter: app.chapter,
            designation: app.designation,
            membership_type: app.membership_type
        }, cardFiles);
        return res.json({
            success: true,
            message: `Application approved successfully. Member ID: ${membershipId}`,
            membership_id: membershipId,
            cardFiles,
            emailResult
        });
    }
    catch (err) {
        console.error('Error approving application:', err);
        return res.status(500).json({ error: err.message || 'Error occurred while approving application.' });
    }
});
// 5. ADMIN: Reject application
router.post('/:id/reject', auth_js_1.requireAdmin, async (req, res) => {
    try {
        const appId = parseInt(req.params.id, 10);
        const { rejection_reason } = req.body;
        const app = index_js_1.db.prepare('SELECT * FROM membership_applications WHERE id = ?').get(appId);
        if (!app) {
            return res.status(404).json({ error: 'Application not found.' });
        }
        index_js_1.db.prepare(`
      UPDATE membership_applications 
      SET status = 'Rejected', rejection_reason = ?, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ?
      WHERE id = ?
    `).run(rejection_reason || null, req.admin.id, appId);
        // Send rejection email
        await (0, emailService_js_1.sendApplicationRejectedEmail)({
            id: appId,
            reference_no: app.reference_no,
            full_name: app.full_name,
            email: app.email,
            rejection_reason
        });
        return res.json({
            success: true,
            message: 'Application marked as rejected and notification email sent.'
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
exports.default = router;
