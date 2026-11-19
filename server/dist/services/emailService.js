"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.sendApplicationReceivedEmail = sendApplicationReceivedEmail;
exports.sendApprovalAndCardEmail = sendApprovalAndCardEmail;
exports.sendApplicationRejectedEmail = sendApplicationRejectedEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const index_js_1 = require("../db/index.js");
const config_js_1 = require("../config.js");
const idCardService_js_1 = require("./idCardService.js");
function resolveDiskPath(filePathOrUrl) {
    if (!filePathOrUrl)
        return '';
    // 1. Direct absolute path check
    if (path_1.default.isAbsolute(filePathOrUrl) && fs_1.default.existsSync(filePathOrUrl)) {
        return filePathOrUrl;
    }
    // 2. Web path starting with /uploads/
    if (filePathOrUrl.startsWith('/uploads/')) {
        const sub = filePathOrUrl.replace(/^\/uploads\//, '');
        const candidate = path_1.default.join(config_js_1.UPLOAD_DIR, sub);
        if (fs_1.default.existsSync(candidate))
            return candidate;
    }
    // 3. Fallback direct inside GENERATED_DIR
    const baseName = path_1.default.basename(filePathOrUrl);
    const genCandidate = path_1.default.join(config_js_1.GENERATED_DIR, baseName);
    if (fs_1.default.existsSync(genCandidate))
        return genCandidate;
    // 4. Try current working directory join
    const cwdCandidate = path_1.default.resolve(process.cwd(), filePathOrUrl.replace(/^\//, ''));
    if (fs_1.default.existsSync(cwdCandidate))
        return cwdCandidate;
    return filePathOrUrl;
}
function getSmtpTransporter() {
    const getSetting = (k) => {
        const row = index_js_1.db.prepare('SELECT value FROM system_settings WHERE key = ?').get(k);
        return row?.value || process.env[k.toUpperCase()] || '';
    };
    const host = getSetting('smtp_host');
    const port = parseInt(getSetting('smtp_port') || '587', 10);
    const user = getSetting('smtp_user');
    const pass = getSetting('smtp_pass');
    const secure = getSetting('smtp_secure') === 'true';
    const from = getSetting('smtp_from') || 'VLBVN Community <membership@vlbvn.org>';
    if (!host || !user) {
        return { transporter: null, from };
    }
    const transporter = nodemailer_1.default.createTransport({
        host,
        port,
        secure,
        auth: {
            user,
            pass
        }
    });
    return { transporter, from };
}
async function sendEmail(params) {
    const { transporter, from } = getSmtpTransporter();
    const attachmentCount = params.attachments?.length || 0;
    // Verify attachment files exist on disk if paths are provided
    const validAttachments = [];
    if (params.attachments && params.attachments.length > 0) {
        for (const att of params.attachments) {
            if (att.content) {
                validAttachments.push(att);
            }
            else if (att.path) {
                const resolved = resolveDiskPath(att.path);
                if (fs_1.default.existsSync(resolved)) {
                    validAttachments.push({
                        ...att,
                        path: resolved
                    });
                }
                else {
                    console.warn(`[EMAIL WARNING] Attachment file not found on disk: ${att.path}`);
                }
            }
        }
    }
    // If transporter is not configured or in dev simulation mode:
    if (!transporter) {
        const attachmentSummary = validAttachments.map(a => `${a.filename} (${a.path ? `${(fs_1.default.statSync(a.path).size / 1024).toFixed(0)} KB` : 'buffer'})`).join(', ');
        console.log(`[EMAIL SIMULATED] To: ${params.to} | Subject: "${params.subject}" | Attachments (${validAttachments.length}): [${attachmentSummary}]`);
        index_js_1.db.prepare(`
      INSERT INTO email_logs (recipient_email, recipient_name, subject, email_type, status, error_message, application_id, member_id)
      VALUES (?, ?, ?, ?, 'SIMULATED', ?, ?, ?)
    `).run(params.to, params.name, params.subject, params.type, `Simulated send (${validAttachments.length} attachments: ${attachmentSummary || 'none'}) - Configure SMTP in Settings for live inbox delivery`, params.applicationId || null, params.memberId || null);
        return {
            success: true,
            status: 'SIMULATED',
            attachmentCount: validAttachments.length,
            error: 'Simulated send (SMTP credentials not yet configured in Admin Settings)'
        };
    }
    try {
        await transporter.sendMail({
            from,
            to: params.to,
            subject: params.subject,
            html: params.html,
            attachments: validAttachments
        });
        console.log(`✔ [EMAIL SENT] To: ${params.to} | Subject: "${params.subject}" | Attached: ${validAttachments.length} file(s)`);
        index_js_1.db.prepare(`
      INSERT INTO email_logs (recipient_email, recipient_name, subject, email_type, status, error_message, application_id, member_id)
      VALUES (?, ?, ?, ?, 'SENT', ?, ?, ?)
    `).run(params.to, params.name, params.subject, params.type, `Delivered with ${validAttachments.length} attachments`, params.applicationId || null, params.memberId || null);
        return { success: true, status: 'SENT', attachmentCount: validAttachments.length };
    }
    catch (err) {
        console.error('Failed to send email via SMTP:', err);
        index_js_1.db.prepare(`
      INSERT INTO email_logs (recipient_email, recipient_name, subject, email_type, status, error_message, application_id, member_id)
      VALUES (?, ?, ?, ?, 'FAILED', ?, ?, ?)
    `).run(params.to, params.name, params.subject, params.type, err?.message || 'Unknown error', params.applicationId || null, params.memberId || null);
        return { success: false, status: 'FAILED', error: err?.message, attachmentCount: validAttachments.length };
    }
}
// 1. Application Submission Email
async function sendApplicationReceivedEmail(app) {
    const statusLink = `${config_js_1.FRONTEND_URL}/status?ref=${encodeURIComponent(app.reference_no)}`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #FAF8F5; margin: 0; padding: 24px; color: #1E293B; }
        .card { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 14px; border: 1px solid #E2D9C8; overflow: hidden; box-shadow: 0 4px 12px -2px rgba(0,0,0,0.06); }
        .header { background: #0F172A; padding: 32px 24px; text-align: center; border-bottom: 4px solid #D4AF37; }
        .header h1 { color: #FFFFFF; margin: 0; font-size: 22px; letter-spacing: 1px; font-weight: bold; }
        .header p { color: #D4AF37; margin: 6px 0 0 0; font-size: 13px; text-transform: uppercase; font-weight: 600; }
        .content { padding: 32px 28px; line-height: 1.6; }
        .ref-box { background: #FFFDF7; border: 2px dashed #D4AF37; border-radius: 10px; padding: 20px; margin: 24px 0; text-align: center; }
        .ref-label { font-size: 12px; color: #7B4F0E; text-transform: uppercase; font-weight: bold; margin-bottom: 4px; }
        .ref-val { font-size: 26px; color: #B8860B; font-weight: 800; font-family: monospace; letter-spacing: 1.5px; }
        .btn { display: inline-block; background: #D4AF37; color: #0F172A; text-decoration: none; padding: 13px 30px; border-radius: 8px; font-weight: bold; font-size: 14px; margin-top: 16px; }
        .footer { background: #F8FAFC; padding: 20px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>VLBVN COMMUNITY</h1>
          <p>Veerashaiva Lingayat Business Visionary Network</p>
        </div>
        <div class="content">
          <p>Dear <strong>${app.full_name}</strong>,</p>
          <p>Thank you for submitting your membership application to the <strong>VLBVN Community</strong> (${app.chapter} Chapter). We are pleased to acknowledge receipt of your application.</p>
          
          <div class="ref-box">
            <div class="ref-label">Your Application Reference Number</div>
            <div class="ref-val">${app.reference_no}</div>
          </div>

          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Our Chapter Verification Committee is currently reviewing your professional credentials.</li>
            <li>Upon approval, your official clean minimalist <strong>Digital Membership ID Card</strong> will be automatically generated and emailed to this address with both <strong>PNG and PDF attachments</strong>.</li>
            <li>Review typically takes 24–48 hours.</li>
          </ul>

          <div style="text-align: center; margin: 26px 0;">
            <a href="${statusLink}" class="btn">Track Application Status</a>
          </div>

          <p>Warm regards,<br>
          <strong>Membership Verification Committee</strong><br>
          VLBVN Community Desk</p>
        </div>
        <div class="footer">
          &copy; 2026 Veerashaiva Lingayat Business Visionary Network (VLBVN). All rights reserved.<br>
          For assistance, contact <a href="mailto:membership@vlbvn.org" style="color: #B8860B;">membership@vlbvn.org</a>
        </div>
      </div>
    </body>
    </html>
  `;
    return sendEmail({
        to: app.email,
        name: app.full_name,
        subject: 'VLBVN Community – Membership Application Received',
        html,
        type: 'APPLICATION_RECEIVED',
        applicationId: app.id
    });
}
// 2. Membership Approval & ID Card Email (ATTACHING BOTH PNG AND PDF)
async function sendApprovalAndCardEmail(member, cardFiles) {
    const safeMid = member.membership_id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const downloadLink = `${config_js_1.FRONTEND_URL}/status?id=${encodeURIComponent(member.membership_id)}`;
    // 1. Resolve or Generate Card Files
    let finalPdfPath = cardFiles?.pdfPath ? resolveDiskPath(cardFiles.pdfPath) : '';
    let finalPngPath = cardFiles?.pngPath ? resolveDiskPath(cardFiles.pngPath) : '';
    // If files don't exist on disk, regenerate them immediately
    if (!fs_1.default.existsSync(finalPdfPath) || !fs_1.default.existsSync(finalPngPath)) {
        try {
            const generated = await (0, idCardService_js_1.generateIdCardFiles)({
                id: member.id,
                membership_id: member.membership_id,
                full_name: member.full_name,
                designation: member.designation,
                company_name: member.company_name || '',
                chapter: member.chapter,
                membership_type: member.membership_type,
                photo_url: member.photo_url || ''
            });
            finalPdfPath = generated.pdfPath;
            finalPngPath = generated.pngPath;
        }
        catch (genErr) {
            console.error('Error generating card files for email attachments:', genErr);
        }
    }
    // 2. Build explicit file attachments array for Nodemailer
    const attachments = [];
    // Attachment 1: High-Resolution Print-Ready PDF
    if (fs_1.default.existsSync(finalPdfPath)) {
        attachments.push({
            filename: `VLBVN_ID_Card_${safeMid}.pdf`,
            path: finalPdfPath,
            contentType: 'application/pdf',
            contentDisposition: 'attachment'
        });
    }
    else {
        console.warn(`[EMAIL ERROR] PDF attachment missing for member ${member.membership_id}: ${finalPdfPath}`);
    }
    // Attachment 2: Clean Light Digital Image PNG
    if (fs_1.default.existsSync(finalPngPath)) {
        attachments.push({
            filename: `VLBVN_ID_Card_${safeMid}.png`,
            path: finalPngPath,
            contentType: 'image/png',
            contentDisposition: 'attachment'
        });
    }
    else {
        console.warn(`[EMAIL ERROR] PNG attachment missing for member ${member.membership_id}: ${finalPngPath}`);
    }
    // 3. Build Email HTML with attachment callout box
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #FAF8F5; margin: 0; padding: 24px; color: #1E293B; }
        .card { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 14px; border: 1px solid #E2D9C8; overflow: hidden; box-shadow: 0 4px 12px -2px rgba(0,0,0,0.06); }
        .header { background: #0F172A; padding: 32px 24px; text-align: center; border-bottom: 4px solid #D4AF37; }
        .header h1 { color: #FFFFFF; margin: 0; font-size: 22px; letter-spacing: 1px; font-weight: bold; }
        .header p { color: #D4AF37; margin: 6px 0 0 0; font-size: 13px; text-transform: uppercase; font-weight: 600; }
        .content { padding: 32px 28px; line-height: 1.6; }
        .badge-box { background: #FFFDF7; border: 2px dashed #D4AF37; border-radius: 10px; padding: 20px; margin: 24px 0; text-align: center; }
        .badge-title { font-size: 12px; color: #7B4F0E; text-transform: uppercase; font-weight: bold; }
        .badge-id { font-size: 28px; color: #0F172A; font-weight: 800; font-family: monospace; letter-spacing: 2px; margin: 8px 0; }
        .badge-sub { font-size: 14px; color: #B8860B; font-weight: 600; }
        .attachment-box { background: #F5EFE6; border: 1px solid #D4AF37; border-radius: 10px; padding: 16px 20px; margin: 22px 0; }
        .attachment-title { color: #855800; font-weight: bold; font-size: 13px; margin-bottom: 8px; }
        .attachment-list { margin: 0; padding-left: 20px; font-size: 13px; color: #334155; }
        .attachment-list li { margin-bottom: 6px; }
        .btn { display: inline-block; background: #D4AF37; color: #0F172A; text-decoration: none; padding: 13px 30px; border-radius: 8px; font-weight: bold; font-size: 14px; margin-top: 18px; }
        .perks { background: #F8FAFC; border-radius: 8px; padding: 16px 20px; margin: 20px 0; font-size: 13px; }
        .footer { background: #F8FAFC; padding: 20px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>VLBVN COMMUNITY</h1>
          <p>Welcome to the Visionary Business Network</p>
        </div>
        <div class="content">
          <p>Dear <strong>${member.full_name}</strong>,</p>
          <p>Congratulations! We are delighted to inform you that your membership application has been <strong>approved</strong> by the VLBVN Governing Committee.</p>
          
          <div class="badge-box">
            <div class="badge-title">Official Membership Identification Number</div>
            <div class="badge-id">${member.membership_id}</div>
            <div class="badge-sub">${member.membership_type} • ${member.chapter} Chapter</div>
          </div>

          <!-- Attachment Highlights Box -->
          <div class="attachment-box">
            <div class="attachment-title">📎 2 Files Attached to this Email:</div>
            <ul class="attachment-list">
              <li>
                <strong>VLBVN_ID_Card_${safeMid}.pdf</strong><br>
                <span style="font-size: 11px; color: #64748B;">Print-ready vector PDF formatted to standard ISO/IEC 7810 CR80 card dimensions (ideal for high-resolution card printing).</span>
              </li>
              <li>
                <strong>VLBVN_ID_Card_${safeMid}.png</strong><br>
                <span style="font-size: 11px; color: #64748B;">Clean minimalist digital card image with official VLBVN emblem & QR code (ideal for smartphones & digital verification).</span>
              </li>
            </ul>
          </div>

          <div class="perks">
            <strong>Membership Privileges:</strong>
            <ul style="margin: 8px 0 0 0; padding-left: 20px;">
              <li>Official digital credentials recognized across all VLBVN Chapters</li>
              <li>Invitations to exclusive business summits, conclaves & global trade meets</li>
              <li>B2B collaboration & cross-chapter trade network access</li>
              <li>Priority listing in the VLBVN Business Directory</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 26px 0;">
            <a href="${downloadLink}" class="btn">View & Download ID Card Online</a>
          </div>

          <p>We look forward to your active participation in building a strong, visionary business ecosystem.</p>

          <p>Warm regards,<br>
          <strong>President & Executive Council</strong><br>
          VLBVN Community</p>
        </div>
        <div class="footer">
          &copy; 2026 Veerashaiva Lingayat Business Visionary Network (VLBVN).<br>
          Need assistance or replacement credentials? Contact <a href="mailto:membership@vlbvn.org" style="color: #B8860B;">membership@vlbvn.org</a>
        </div>
      </div>
    </body>
    </html>
  `;
    return sendEmail({
        to: member.email,
        name: member.full_name,
        subject: 'Welcome to VLBVN Community – Your Membership ID Card (Attached: PNG & PDF)',
        html,
        type: 'CARD_APPROVED',
        attachments,
        applicationId: member.application_id,
        memberId: member.id
    });
}
// 3. Application Rejection Email
async function sendApplicationRejectedEmail(app) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #FAF8F5; margin: 0; padding: 24px; color: #1E293B; }
        .card { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 14px; border: 1px solid #E2D9C8; overflow: hidden; box-shadow: 0 4px 12px -2px rgba(0,0,0,0.06); }
        .header { background: #0F172A; padding: 32px 24px; text-align: center; border-bottom: 4px solid #94A3B8; }
        .header h1 { color: #FFFFFF; margin: 0; font-size: 22px; letter-spacing: 1px; }
        .content { padding: 32px 28px; line-height: 1.6; }
        .reason-box { background: #FEF2F2; border-left: 4px solid #EF4444; padding: 16px; margin: 20px 0; border-radius: 6px; }
        .footer { background: #F8FAFC; padding: 20px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>VLBVN COMMUNITY</h1>
        </div>
        <div class="content">
          <p>Dear <strong>${app.full_name}</strong>,</p>
          <p>Thank you for your interest in joining VLBVN Community. We have reviewed your application (Reference: <strong>${app.reference_no}</strong>).</p>
          
          <p>We regret to inform you that your application could not be approved at this time.</p>

          ${app.rejection_reason ? `
            <div class="reason-box">
              <strong style="color: #991B1B;">Administrative Remarks:</strong><br>
              <span style="color: #374151;">${app.rejection_reason}</span>
            </div>
          ` : ''}

          <p>If you wish to provide clarified professional credentials or updated documentation, please contact our membership desk at <a href="mailto:membership@vlbvn.org" style="color: #B8860B;">membership@vlbvn.org</a>.</p>

          <p>Sincerely,<br>
          <strong>Membership Verification Committee</strong><br>
          VLBVN Community</p>
        </div>
        <div class="footer">
          &copy; 2026 Veerashaiva Lingayat Business Visionary Network (VLBVN).
        </div>
      </div>
    </body>
    </html>
  `;
    return sendEmail({
        to: app.email,
        name: app.full_name,
        subject: 'VLBVN Community – Update on Your Membership Application',
        html,
        type: 'APPLICATION_REJECTED',
        applicationId: app.id
    });
}
