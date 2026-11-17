import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { db } from '../db/index.js';
import { requireAdmin } from '../middleware/auth.js';
import { sendEmail, EmailAttachment } from '../services/emailService.js';
import { GENERATED_DIR, TEMPLATES_DIR } from '../config.js';

const router = Router();

router.get('/', requireAdmin, (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM system_settings').all() as Array<{ key: string; value: string }>;
    const settings: Record<string, string> = {};
    for (const r of rows) {
      // Mask sensitive password if present
      if (r.key === 'smtp_pass' && r.value) {
        settings[r.key] = '••••••••';
      } else {
        settings[r.key] = r.value;
      }
    }
    return res.json({ settings });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/', requireAdmin, (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Settings object is required.' });
    }

    const upsertStmt = db.prepare(`
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
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/test-email', requireAdmin, async (req, res) => {
  try {
    const { testEmail, includeAttachments } = req.body;
    if (!testEmail) {
      return res.status(400).json({ error: 'Test recipient email is required.' });
    }

    const attachments: EmailAttachment[] = [];

    // Find sample generated PDF and PNG files in GENERATED_DIR if available
    if (fs.existsSync(GENERATED_DIR)) {
      const files = fs.readdirSync(GENERATED_DIR);
      const pdfFile = files.find(f => f.endsWith('.pdf'));
      const pngFile = files.find(f => f.endsWith('.png'));

      if (pdfFile) {
        attachments.push({
          filename: pdfFile,
          path: path.join(GENERATED_DIR, pdfFile),
          contentType: 'application/pdf',
          contentDisposition: 'attachment'
        });
      }
      if (pngFile) {
        attachments.push({
          filename: pngFile,
          path: path.join(GENERATED_DIR, pngFile),
          contentType: 'image/png',
          contentDisposition: 'attachment'
        });
      }
    }

    const result = await sendEmail({
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
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
