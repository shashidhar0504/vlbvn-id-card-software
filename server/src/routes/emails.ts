import { Router } from 'express';
import { db } from '../db/index.js';
import { requireAdmin } from '../middleware/auth.js';
import { sendEmail, sendApprovalAndCardEmail } from '../services/emailService.js';

const router = Router();

// GET email logs
router.get('/', requireAdmin, (req, res) => {
  try {
    const { status, type, search, page = '1', limit = '50' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, parseInt(limit as string, 10));
    const offset = (pageNum - 1) * limitNum;

    let query = 'SELECT * FROM email_logs WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (type && type !== 'all') {
      query += ' AND email_type = ?';
      params.push(type);
    }

    if (search) {
      query += ' AND (recipient_email LIKE ? OR recipient_name LIKE ? OR subject LIKE ?)';
      const p = `%${search}%`;
      params.push(p, p, p);
    }

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const logs = db.prepare(query).all(...params);
    const total = (db.prepare('SELECT COUNT(*) as c FROM email_logs').get() as { c: number }).c;

    return res.json({ total, page: pageNum, limit: limitNum, logs });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST resend email log
router.post('/:id/resend', requireAdmin, async (req, res) => {
  try {
    const log = db.prepare('SELECT * FROM email_logs WHERE id = ?').get(req.params.id) as any;
    if (!log) {
      return res.status(404).json({ error: 'Email log not found.' });
    }

    // If this was an approval email and member exists, re-dispatch with full PDF + PNG attachments
    if (log.email_type === 'CARD_APPROVED' && log.member_id) {
      const member = db.prepare('SELECT * FROM members WHERE id = ?').get(log.member_id) as any;
      if (member) {
        const result = await sendApprovalAndCardEmail({
          id: member.id,
          application_id: member.application_id,
          membership_id: member.membership_id,
          full_name: member.full_name,
          email: member.email,
          chapter: member.chapter,
          designation: member.designation,
          membership_type: member.membership_type,
          photo_url: member.photo_url,
          company_name: member.company_name
        });
        return res.json({ success: true, result });
      }
    }

    // Generic resend for other types
    const result = await sendEmail({
      to: log.recipient_email,
      name: log.recipient_name,
      subject: `[RESENT] ${log.subject}`,
      html: `<p>This is a resent notification regarding your VLBVN Community application.</p><p>Original Subject: ${log.subject}</p>`,
      type: log.email_type,
      applicationId: log.application_id,
      memberId: log.member_id
    });

    return res.json({ success: true, result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
