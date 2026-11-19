"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDefaultTemplateFile = ensureDefaultTemplateFile;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const canvas_1 = require("@napi-rs/canvas");
const config_js_1 = require("../config.js");
async function ensureDefaultTemplateFile() {
    if (!fs_1.default.existsSync(config_js_1.TEMPLATES_DIR)) {
        fs_1.default.mkdirSync(config_js_1.TEMPLATES_DIR, { recursive: true });
    }
    const defaultPath = path_1.default.join(config_js_1.TEMPLATES_DIR, 'vlbvn_light_template.png');
    // Always regenerate to apply updated clean light theme and exact logo
    const width = 1012;
    const height = 638;
    const canvas = (0, canvas_1.createCanvas)(width, height);
    const ctx = canvas.getContext('2d');
    // 1. Base Background: Clean, crisp luxury light pearl / ivory gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#FFFFFF');
    bgGrad.addColorStop(0.5, '#FAF8F5');
    bgGrad.addColorStop(1, '#F5EFE6');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
    // 2. Subtle Micro Watermark / Geometric Motif
    ctx.save();
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.06)';
    ctx.lineWidth = 1;
    for (let r = 80; r < 750; r += 55) {
        ctx.beginPath();
        ctx.arc(width - 120, height - 80, r, 0, Math.PI * 2);
        ctx.stroke();
    }
    for (let r = 60; r < 500; r += 50) {
        ctx.beginPath();
        ctx.arc(140, 100, r, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();
    // 3. Elegant Subtle Outer Card Border
    // Hairline gold border
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, width - 32, height - 32);
    ctx.strokeStyle = 'rgba(184, 134, 11, 0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(22, 22, width - 44, height - 44);
    // Subtle Corner Accents
    const cornerSize = 20;
    ctx.fillStyle = '#D4AF37';
    // Top-left
    ctx.fillRect(15, 15, cornerSize, 3);
    ctx.fillRect(15, 15, 3, cornerSize);
    // Top-right
    ctx.fillRect(width - 15 - cornerSize, 15, cornerSize, 3);
    ctx.fillRect(width - 18, 15, 3, cornerSize);
    // Bottom-left
    ctx.fillRect(15, height - 18, cornerSize, 3);
    ctx.fillRect(15, height - 15 - cornerSize, 3, cornerSize);
    // Bottom-right
    ctx.fillRect(width - 15 - cornerSize, height - 18, cornerSize, 3);
    ctx.fillRect(width - 18, height - 15 - cornerSize, 3, cornerSize);
    // 4. Top Accent Ribbon (Gold to bronze gradient)
    const topRibbon = ctx.createLinearGradient(24, 24, width - 24, 24);
    topRibbon.addColorStop(0, '#B8860B');
    topRibbon.addColorStop(0.5, '#E5C158');
    topRibbon.addColorStop(1, '#996515');
    ctx.fillStyle = topRibbon;
    ctx.fillRect(24, 24, width - 48, 5);
    // 5. Draw EXACT Official Logo Image
    const candidateLogos = [
        path_1.default.join(config_js_1.TEMPLATES_DIR, 'vlbvn_logo.jpg'),
        path_1.default.resolve(process.cwd(), 'uploads', 'templates', 'vlbvn_logo.jpg'),
        path_1.default.resolve(process.cwd(), 'server', 'uploads', 'templates', 'vlbvn_logo.jpg'),
        path_1.default.resolve(process.cwd(), 'client', 'public', 'vlbvn_logo.jpg'),
        path_1.default.resolve(process.cwd(), '..', 'client', 'public', 'vlbvn_logo.jpg')
    ];
    const logoPath = candidateLogos.find(p => fs_1.default.existsSync(p)) || candidateLogos[0];
    if (fs_1.default.existsSync(logoPath)) {
        try {
            const logoImg = await (0, canvas_1.loadImage)(logoPath);
            // Draw circular clipped logo
            ctx.save();
            const lx = 48;
            const ly = 38;
            const lsize = 86;
            ctx.beginPath();
            ctx.arc(lx + lsize / 2, ly + lsize / 2, lsize / 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(logoImg, lx, ly, lsize, lsize);
            ctx.restore();
            // Outer gold ring around logo
            ctx.save();
            ctx.strokeStyle = '#D4AF37';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(48 + 43, 38 + 43, 44, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        catch (err) {
            console.error('Error drawing official logo:', err);
        }
    }
    // 6. Header Typography (Clean, Minimalist, Charcoal + Gold)
    ctx.textAlign = 'left';
    // Main Community Title
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 24px "Cinzel", "Georgia", serif';
    ctx.fillText('VLBVN COMMUNITY', 150, 68);
    // Full Name Subtitle
    ctx.fillStyle = '#996515';
    ctx.font = 'bold 12.5px "Inter", "Segoe UI", sans-serif';
    ctx.letterSpacing = '0.5px';
    ctx.fillText('VEERASHAIVA LINGAYAT BUSINESS VISIONARY NETWORK', 150, 90);
    // Tagline
    ctx.fillStyle = '#64748B';
    ctx.font = '500 11px "Inter", sans-serif';
    ctx.fillText('CONNECT  •  COLLABORATE  •  PROSPER', 150, 108);
    // Top-Right Official Membership Badge Pill
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(width - 235, 50, 190, 36, 18);
    ctx.fillStyle = '#FFFDF7';
    ctx.fill();
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#855800';
    ctx.font = 'bold 12px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ OFFICIAL MEMBER ★', width - 140, 72);
    ctx.restore();
    // Subtle Separator Line below Header
    const sepGrad = ctx.createLinearGradient(48, 134, width - 48, 134);
    sepGrad.addColorStop(0, '#B8860B');
    sepGrad.addColorStop(0.5, '#E5C158');
    sepGrad.addColorStop(1, '#B8860B');
    ctx.fillStyle = sepGrad;
    ctx.fillRect(48, 134, width - 96, 1.5);
    // 7. Photo Frame Placeholder Box (Clean, Crisp, Light)
    // Position: x=52, y=156, width=190, height=230
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(52, 156, 190, 230, 10);
    ctx.fill();
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Inner dashed guideline
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(60, 164, 174, 214);
    ctx.restore();
    // 8. Minimalist Field Labels Printed on Background
    ctx.fillStyle = '#64748B'; // slate 500
    ctx.font = '600 11px "Inter", sans-serif';
    ctx.textAlign = 'left';
    // Labels for reference on background
    ctx.fillText('MEMBER FULL NAME', 280, 172);
    ctx.fillText('MEMBERSHIP ID', 280, 248);
    ctx.fillText('CHAPTER / REGION', 610, 248);
    ctx.fillText('DESIGNATION & COMPANY', 280, 324);
    ctx.fillText('MEMBERSHIP TIER', 280, 404);
    ctx.fillText('VALID THRU', 610, 404);
    // Delicate hairline separator lines under field rows
    ctx.fillStyle = '#EBE5D8';
    ctx.fillRect(280, 222, width - 340, 1);
    ctx.fillRect(280, 298, width - 340, 1);
    ctx.fillRect(280, 380, width - 340, 1);
    // 9. QR Code Box (Clean Light)
    // Position: x=825, y=410, width=130, height=130
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(825, 410, 130, 130, 8);
    ctx.fill();
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#475569';
    ctx.font = '600 10px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCAN TO VERIFY', 890, 558);
    ctx.restore();
    // 10. Minimalist Clean Footer Bar
    const footLine = ctx.createLinearGradient(48, height - 58, width - 48, height - 58);
    footLine.addColorStop(0, '#B8860B');
    footLine.addColorStop(0.5, '#E5C158');
    footLine.addColorStop(1, '#B8860B');
    ctx.fillStyle = footLine;
    ctx.fillRect(48, height - 58, width - 96, 1.2);
    ctx.fillStyle = '#855800';
    ctx.font = '600 11px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🌐 https://vlbvn.org', 52, height - 36);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#64748B';
    ctx.font = '500 11px "Inter", sans-serif';
    ctx.fillText('Veerashaiva Lingayat Business Visionary Network • Official Digital Credential', width - 52, height - 36);
    // Save to file
    const buffer = canvas.toBuffer('image/png');
    fs_1.default.writeFileSync(defaultPath, buffer);
    console.log('✔ Clean light VLBVN template generated with exact logo:', defaultPath);
    return defaultPath;
}
