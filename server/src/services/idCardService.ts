import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { db } from '../db/index.js';
import { GENERATED_DIR, BASE_URL, FRONTEND_URL, UPLOAD_DIR } from '../config.js';

export interface MemberCardData {
  id?: number;
  membership_id: string;
  full_name: string;
  designation: string;
  company_name: string;
  chapter: string;
  membership_type: string;
  photo_url: string;
  valid_until?: string;
}

export interface FieldConfig {
  id?: number;
  field_key: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  font_size: number;
  font_family: string;
  font_weight: string;
  text_color: string;
  text_align: 'left' | 'center' | 'right';
  is_visible: number;
  border_radius?: number;
  border_color?: string;
  border_width?: number;
  side?: string;
}

export interface TemplateRecord {
  id: number;
  name: string;
  card_width: number;
  card_height: number;
  orientation: string;
  front_background_url: string;
  back_background_url?: string;
  is_active: number;
}

function resolveAssetPath(webOrRelativePath: string): string {
  if (webOrRelativePath.startsWith('/uploads/')) {
    const sub = webOrRelativePath.replace('/uploads/', '');
    return path.join(UPLOAD_DIR, sub);
  }
  if (path.isAbsolute(webOrRelativePath)) {
    return webOrRelativePath;
  }
  return path.join(UPLOAD_DIR, webOrRelativePath);
}

// Fallback avatar generator if applicant photo is missing or fails to load
function createDefaultAvatarBuffer(initials: string, width: number, height: number): Buffer {
  const canvas = createCanvas(width, height);
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

export async function renderCardCanvas(
  member: MemberCardData,
  template: TemplateRecord,
  fields: FieldConfig[]
) {
  const width = template.card_width || 1012;
  const height = template.card_height || 638;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 1. Draw Background
  const bgPath = resolveAssetPath(template.front_background_url);
  if (fs.existsSync(bgPath)) {
    const bgImage = await loadImage(bgPath);
    ctx.drawImage(bgImage, 0, 0, width, height);
  } else {
    // Elegant fallback background
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, width - 20, height - 20);
  }

  // 2. Render Dynamic Fields
  for (const field of fields) {
    if (!field.is_visible) continue;

    const x = Number(field.x);
    const y = Number(field.y);
    const w = Number(field.width);
    const h = Number(field.height);

    if (field.field_key === 'photo') {
      try {
        let photoImg;
        const photoPath = resolveAssetPath(member.photo_url);
        if (fs.existsSync(photoPath)) {
          photoImg = await loadImage(photoPath);
        } else {
          const initials = (member.full_name || 'VL').split(' ').map(s => s[0]).join('');
          const buf = createDefaultAvatarBuffer(initials, w, h);
          photoImg = await loadImage(buf);
        }

        ctx.save();
        const borderRadius = field.border_radius || 0;
        ctx.beginPath();
        if (borderRadius >= w / 2) {
          ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
        } else if (borderRadius > 0) {
          ctx.roundRect(x, y, w, h, borderRadius);
        } else {
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
          } else if (borderRadius > 0) {
            ctx.roundRect(x, y, w, h, borderRadius);
          } else {
            ctx.rect(x, y, w, h);
          }
          ctx.stroke();
          ctx.restore();
        }
      } catch (err) {
        console.error('Error drawing member photo:', err);
      }
      continue;
    }

    if (field.field_key === 'qr_code') {
      try {
        const verifyUrl = `${FRONTEND_URL}/status?id=${encodeURIComponent(member.membership_id)}`;
        const qrBuffer = await QRCode.toBuffer(verifyUrl, {
          width: w,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        const qrImg = await loadImage(qrBuffer);

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
      } catch (err) {
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

    if (!textValue) continue;

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
    } else if (field.text_align === 'right') {
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

export async function generateIdCardFiles(member: MemberCardData, templateId?: number) {
  if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
  }

  // 1. Fetch Template
  let template: TemplateRecord | undefined;
  if (templateId) {
    template = db.prepare('SELECT * FROM id_card_templates WHERE id = ?').get(templateId) as TemplateRecord | undefined;
  }
  if (!template) {
    template = db.prepare('SELECT * FROM id_card_templates WHERE is_active = 1').get() as TemplateRecord | undefined;
  }
  if (!template) {
    template = db.prepare('SELECT * FROM id_card_templates ORDER BY id DESC LIMIT 1').get() as TemplateRecord | undefined;
  }
  if (!template) {
    throw new Error('No ID Card Template configured.');
  }

  // 2. Fetch Field Configurations
  const fields = db.prepare(`
    SELECT * FROM id_card_field_configs WHERE template_id = ?
  `).all(template.id) as unknown as FieldConfig[];

  // 3. Render Canvas
  const canvas = await renderCardCanvas(member, template, fields);
  const pngBuffer = canvas.toBuffer('image/png');

  // File names sanitized
  const safeMid = member.membership_id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const pngFileName = `VLBVN_Card_${safeMid}.png`;
  const pdfFileName = `VLBVN_Card_${safeMid}.pdf`;

  const pngFilePath = path.join(GENERATED_DIR, pngFileName);
  const pdfFilePath = path.join(GENERATED_DIR, pdfFileName);

  // Write PNG
  fs.writeFileSync(pngFilePath, pngBuffer);

  // 4. Generate High-Quality PDF using PDFKit
  // Standard CR80 Card Size in points: 3.375 x 2.125 inches (243 x 153 pt)
  await new Promise<void>((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [243, 153], // Exactly CR80 card dimensions
        margins: { top: 0, bottom: 0, left: 0, right: 0 }
      });

      const writeStream = fs.createWriteStream(pdfFilePath);
      doc.pipe(writeStream);

      // Embed high-res card image to fill the card bounds exactly
      doc.image(pngBuffer, 0, 0, {
        width: 243,
        height: 153
      });

      doc.end();
      writeStream.on('finish', () => resolve());
      writeStream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });

  // 5. Store record in database
  if (member.id) {
    const existing = db.prepare('SELECT id FROM generated_id_cards WHERE member_id = ?').get(member.id) as { id: number } | undefined;
    if (existing) {
      db.prepare(`
        UPDATE generated_id_cards 
        SET template_id = ?, png_path = ?, pdf_path = ?, generated_at = CURRENT_TIMESTAMP, version = version + 1
        WHERE member_id = ?
      `).run(template.id, `/uploads/generated/${pngFileName}`, `/uploads/generated/${pdfFileName}`, member.id);
    } else {
      db.prepare(`
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
