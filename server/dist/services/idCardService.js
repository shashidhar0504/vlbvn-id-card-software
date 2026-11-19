"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderCardCanvas = renderCardCanvas;
exports.generateIdCardFiles = generateIdCardFiles;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const canvas_1 = require("@napi-rs/canvas");
const pdfkit_1 = __importDefault(require("pdfkit"));
const qrcode_1 = __importDefault(require("qrcode"));
const index_js_1 = require("../db/index.js");
const config_js_1 = require("../config.js");
function resolveAssetPath(webOrRelativePath) {
    if (webOrRelativePath.startsWith('/uploads/')) {
        const sub = webOrRelativePath.replace('/uploads/', '');
        return path_1.default.join(config_js_1.UPLOAD_DIR, sub);
    }
    if (path_1.default.isAbsolute(webOrRelativePath)) {
        return webOrRelativePath;
    }
    return path_1.default.join(config_js_1.UPLOAD_DIR, webOrRelativePath);
}
// Fallback avatar generator if applicant photo is missing or fails to load
function createDefaultAvatarBuffer(initials, width, height) {
    const canvas = (0, canvas_1.createCanvas)(width, height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.4, width * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.95, width * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0F172A';
    ctx.font = `bold ${Math.floor(width * 0.2)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials.slice(0, 2).toUpperCase(), width / 2, height * 0.4);
    return canvas.toBuffer('image/png');
}
async function renderCardCanvas(member, template, fields) {
    const width = template.card_width || 1012;
    const height = template.card_height || 638;
    const canvas = (0, canvas_1.createCanvas)(width, height);
    const ctx = canvas.getContext('2d');
    // 1. Draw Background
    const bgPath = resolveAssetPath(template.front_background_url);
    if (fs_1.default.existsSync(bgPath)) {
        const bgImage = await (0, canvas_1.loadImage)(bgPath);
        ctx.drawImage(bgImage, 0, 0, width, height);
    }
    else {
        // Elegant fallback background
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, width - 20, height - 20);
    }
    // 2. Render Dynamic Fields
    for (const field of fields) {
        if (!field.is_visible)
            continue;
        const x = Number(field.x);
        const y = Number(field.y);
        const w = Number(field.width);
        const h = Number(field.height);
        if (field.field_key === 'photo') {
            try {
                let photoImg;
                const photoPath = resolveAssetPath(member.photo_url);
                if (fs_1.default.existsSync(photoPath)) {
                    photoImg = await (0, canvas_1.loadImage)(photoPath);
                }
                else {
                    const initials = (member.full_name || 'VL').split(' ').map(s => s[0]).join('');
                    const buf = createDefaultAvatarBuffer(initials, w, h);
                    photoImg = await (0, canvas_1.loadImage)(buf);
                }
                ctx.save();
                const borderRadius = field.border_radius || 0;
                ctx.beginPath();
                if (borderRadius >= w / 2) {
                    ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
                }
                else if (borderRadius > 0) {
                    ctx.roundRect(x, y, w, h, borderRadius);
                }
                else {
                    ctx.rect(x, y, w, h);
                }
                ctx.clip();
                // Draw image covering the designated photo box
                ctx.drawImage(photoImg, x, y, w, h);
                ctx.restore();
                // Draw outer border if configured
                if (field.border_width && field.border_width > 0) {
                    ctx.save();
                    ctx.strokeStyle = field.border_color || '#D4AF37';
                    ctx.lineWidth = field.border_width;
                    ctx.beginPath();
                    if (borderRadius >= w / 2) {
                        ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
                    }
                    else if (borderRadius > 0) {
                        ctx.roundRect(x, y, w, h, borderRadius);
                    }
                    else {
                        ctx.rect(x, y, w, h);
                    }
                    ctx.stroke();
                    ctx.restore();
                }
            }
            catch (err) {
                console.error('Error drawing member photo:', err);
            }
            continue;
        }
        if (field.field_key === 'qr_code') {
            try {
                const verifyUrl = `${config_js_1.FRONTEND_URL}/status?id=${encodeURIComponent(member.membership_id)}`;
                const qrBuffer = await qrcode_1.default.toBuffer(verifyUrl, {
                    width: w,
                    margin: 1,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
                const qrImg = await (0, canvas_1.loadImage)(qrBuffer);
                ctx.save();
                const borderRadius = field.border_radius || 4;
                ctx.beginPath();
                ctx.roundRect(x, y, w, h, borderRadius);
                ctx.clip();
                ctx.drawImage(qrImg, x, y, w, h);
                ctx.restore();
                if (field.border_width && field.border_width > 0) {
                    ctx.save();
                    ctx.strokeStyle = field.border_color || '#D4AF37';
                    ctx.lineWidth = field.border_width;
                    ctx.beginPath();
                    ctx.roundRect(x, y, w, h, borderRadius);
                    ctx.stroke();
                    ctx.restore();
                }
            }
            catch (err) {
                console.error('Error rendering QR Code:', err);
            }
            continue;
        }
        // Text fields rendering
        let textValue = '';
        switch (field.field_key) {
            case 'name':
                textValue = member.full_name || '';
                break;
            case 'member_id':
                textValue = member.membership_id || '';
                break;
            case 'designation':
                textValue = member.company_name
                    ? `${member.designation} • ${member.company_name}`
                    : member.designation || '';
                break;
            case 'company':
                textValue = member.company_name || '';
                break;
            case 'chapter':
                textValue = member.chapter || '';
                break;
            case 'membership_type':
                textValue = member.membership_type || 'Active Member';
                break;
            case 'validity':
                textValue = member.valid_until || 'Life Member';
                break;
            default:
                textValue = '';
        }
        if (!textValue)
            continue;
        ctx.save();
        const fontSize = field.font_size || 20;
        const fontFamily = field.font_family || 'Inter';
        const fontWeight = field.font_weight || 'normal';
        ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", "Inter", sans-serif`;
        ctx.fillStyle = field.text_color || '#FFFFFF';
        ctx.textAlign = field.text_align || 'left';
        ctx.textBaseline = 'top';
        let textX = x;
        if (field.text_align === 'center') {
            textX = x + w / 2;
        }
        else if (field.text_align === 'right') {
            textX = x + w;
        }
        // Check if text exceeds field width, auto-shrink or truncate gently
        let renderedText = textValue;
        let textWidth = ctx.measureText(renderedText).width;
        if (w > 0 && textWidth > w) {
            // Try slightly smaller font if overflowing
            const scaledSize = Math.max(12, Math.floor(fontSize * (w / textWidth)));
            ctx.font = `${fontWeight} ${scaledSize}px "${fontFamily}", "Inter", sans-serif`;
        }
        ctx.fillText(renderedText, textX, y);
        ctx.restore();
    }
    return canvas;
}
async function generateIdCardFiles(member, templateId) {
    if (!fs_1.default.existsSync(config_js_1.GENERATED_DIR)) {
        fs_1.default.mkdirSync(config_js_1.GENERATED_DIR, { recursive: true });
    }
    // 1. Fetch Template
    let template;
    if (templateId) {
        template = index_js_1.db.prepare('SELECT * FROM id_card_templates WHERE id = ?').get(templateId);
    }
    if (!template) {
        template = index_js_1.db.prepare('SELECT * FROM id_card_templates WHERE is_active = 1').get();
    }
    if (!template) {
        template = index_js_1.db.prepare('SELECT * FROM id_card_templates ORDER BY id DESC LIMIT 1').get();
    }
    if (!template) {
        throw new Error('No ID Card Template configured.');
    }
    // 2. Fetch Field Configurations
    const fields = index_js_1.db.prepare(`
    SELECT * FROM id_card_field_configs WHERE template_id = ?
  `).all(template.id);
    // 3. Render Canvas
    const canvas = await renderCardCanvas(member, template, fields);
    const pngBuffer = canvas.toBuffer('image/png');
    // File names sanitized
    const safeMid = member.membership_id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const pngFileName = `VLBVN_Card_${safeMid}.png`;
    const pdfFileName = `VLBVN_Card_${safeMid}.pdf`;
    const pngFilePath = path_1.default.join(config_js_1.GENERATED_DIR, pngFileName);
    const pdfFilePath = path_1.default.join(config_js_1.GENERATED_DIR, pdfFileName);
    // Write PNG
    fs_1.default.writeFileSync(pngFilePath, pngBuffer);
    // 4. Generate High-Quality PDF using PDFKit
    // Standard CR80 Card Size in points: 3.375 x 2.125 inches (243 x 153 pt)
    await new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({
                size: [243, 153], // Exactly CR80 card dimensions
                margins: { top: 0, bottom: 0, left: 0, right: 0 }
            });
            const writeStream = fs_1.default.createWriteStream(pdfFilePath);
            doc.pipe(writeStream);
            // Embed high-res card image to fill the card bounds exactly
            doc.image(pngBuffer, 0, 0, {
                width: 243,
                height: 153
            });
            doc.end();
            writeStream.on('finish', () => resolve());
            writeStream.on('error', reject);
        }
        catch (err) {
            reject(err);
        }
    });
    // 5. Store record in database
    if (member.id) {
        const existing = index_js_1.db.prepare('SELECT id FROM generated_id_cards WHERE member_id = ?').get(member.id);
        if (existing) {
            index_js_1.db.prepare(`
        UPDATE generated_id_cards 
        SET template_id = ?, png_path = ?, pdf_path = ?, generated_at = CURRENT_TIMESTAMP, version = version + 1
        WHERE member_id = ?
      `).run(template.id, `/uploads/generated/${pngFileName}`, `/uploads/generated/${pdfFileName}`, member.id);
        }
        else {
            index_js_1.db.prepare(`
        INSERT INTO generated_id_cards (member_id, template_id, png_path, pdf_path)
        VALUES (?, ?, ?, ?)
      `).run(member.id, template.id, `/uploads/generated/${pngFileName}`, `/uploads/generated/${pdfFileName}`);
        }
    }
    return {
        pngPath: pngFilePath,
        pdfPath: pdfFilePath,
        pngUrl: `/uploads/generated/${pngFileName}`,
        pdfUrl: `/uploads/generated/${pdfFileName}`,
        templateId: template.id
    };
}
