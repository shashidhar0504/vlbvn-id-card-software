"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const index_js_1 = require("../db/index.js");
const auth_js_1 = require("../middleware/auth.js");
const emailService_js_1 = require("../services/emailService.js");
const config_js_1 = require("../config.js");
const router = (0, express_1.Router)();
router.get('/', auth_js_1.requireAdmin, (req, res) => {
    try {
        const rows = index_js_1.db.prepare('SELECT key, value FROM system_settings').all();
        const settings = {};
        for (const r of rows) {
            // Mask sensitive password if present
            if (r.key === 'smtp_pass' && r.value) {
                settings[r.key] = '••••••••';
            }
            else {
                settings[r.key] = r.value;
            }
        }
        return res.json({ settings });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
router.put('/', auth_js_1.requireAdmin, (req, res) => {
    try {
        const { settings } = req.body;
        if (!settings || typeof settings !== 'object') {
            return res.status(400).json({ error: 'Settings object is required.' });
        }
        const upsertStmt = index_js_1.db.prepare(`
      INSERT INTO system_settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `);
        for (const [key, value] of Object.entries(settings)) {
            // Don't overwrite password if masked string sent back
            if (key === 'smtp_pass' && value === '••••••••') {
                continue;
            }
            upsertStmt.run(key, String(value));
        }
        return res.json({ success: true, message: 'Settings saved successfully.' });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
router.post('/test-email', auth_js_1.requireAdmin, async (req, res) => {
    try {
        const { testEmail, includeAttachments } = req.body;
        if (!testEmail) {
            return res.status(400).json({ error: 'Test recipient email is required.' });
        }
        const attachments = [];
        // Find sample generated PDF and PNG files in GENERATED_DIR if available
        if (fs_1.default.existsSync(config_js_1.GENERATED_DIR)) {
            const files = fs_1.default.readdirSync(config_js_1.GENERATED_DIR);
            const pdfFile = files.find(f => f.endsWith('.pdf'));
            const pngFile = files.find(f => f.endsWith('.png'));
            if (pdfFile) {
                attachments.push({
                    filename: pdfFile,
                    path: path_1.default.join(config_js_1.GENERATED_DIR, pdfFile),
                    contentType: 'application/pdf',
                    contentDisposition: 'attachment'
                });
            }
            if (pngFile) {
                attachments.push({
                    filename: pngFile,
                    path: path_1.default.join(config_js_1.GENERATED_DIR, pngFile),
                    contentType: 'image/png',
                    contentDisposition: 'attachment'
                });
            }
        }
        const result = await (0, emailService_js_1.sendEmail)({
            to: testEmail,
            name: 'VLBVN Administrator',
            subject: `VLBVN System – SMTP Test Notification (With Attachments: ${attachments.length})`,
            html: `
        <div style="font-family: sans-serif; padding: 24px; background: #FAF8F5; border-radius: 12px; border: 1px solid #D4AF37; max-width: 600px;">
          <h2 style="color: #0F172A; margin: 0 0 10px 0;">VLBVN SMTP Connectivity Test</h2>
          <p style="color: #334155; line-height: 1.5;">This confirms that your VLBVN Community automated email delivery configuration is operational.</p>
          
          <div style="background: #FFFFFF; border: 1px solid #E2D9C8; border-radius: 8px; padding: 14px 18px; margin: 18px 0;">
            <p style="margin: 0; font-weight: bold; color: #855800; font-size: 13px;">📎 Attached Test Files (${attachments.length}):</p>
            <ul style="margin: 6px 0 0 0; padding-left: 20px; font-size: 12px; color: #475569;">
              ${attachments.map(a => `<li><strong>${a.filename}</strong> (${a.contentType})</li>`).join('') || '<li>No files in generated directory yet.</li>'}
            </ul>
          </div>

          <p style="color: #94A3B8; font-size: 11px; margin-top: 20px;">Sent at: ${new Date().toISOString()}</p>
        </div>
      `,
            type: 'APPLICATION_RECEIVED',
            attachments
        });
        return res.json({
            success: result.success,
            status: result.status,
            error: result.error,
            attachmentCount: attachments.length
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
exports.default = router;
