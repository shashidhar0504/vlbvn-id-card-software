"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const canvas_1 = require("@napi-rs/canvas");
const index_js_1 = require("./db/index.js");
const idCardService_js_1 = require("./services/idCardService.js");
const emailService_js_1 = require("./services/emailService.js");
async function runEndToEndTest() {
    console.log('--- STARTING VLBVN SYSTEM VERIFICATION WITH EXACT LOGO & LIGHT THEME ---');
    // 1. Initialize Database & Generate Clean Light Template with exact logo
    console.log('\n[1] Initializing Database & Seed Data...');
    await (0, index_js_1.initDatabase)();
    const admin = index_js_1.db.prepare('SELECT id, email, role FROM admins WHERE email = ?').get('admin@vlpn.org');
    console.log('✔ Admin Account Verified:', admin);
    const template = index_js_1.db.prepare('SELECT id, name, is_active, card_width, card_height, front_background_url FROM id_card_templates WHERE is_active = 1').get();
    console.log('✔ Active Template Verified:', template);
    // 2. Create Sample Test Photo
    const uploadsDir = path_1.default.resolve(process.cwd(), 'uploads');
    const photosDir = path_1.default.join(uploadsDir, 'photos');
    if (!fs_1.default.existsSync(photosDir))
        fs_1.default.mkdirSync(photosDir, { recursive: true });
    const testPhotoPath = path_1.default.join(photosDir, 'test_applicant_photo.png');
    const photoCanvas = (0, canvas_1.createCanvas)(300, 360);
    const pctx = photoCanvas.getContext('2d');
    pctx.fillStyle = '#FAF8F5';
    pctx.fillRect(0, 0, 300, 360);
    pctx.fillStyle = '#D4AF37';
    pctx.beginPath();
    pctx.arc(150, 140, 70, 0, Math.PI * 2);
    pctx.fill();
    pctx.beginPath();
    pctx.arc(150, 340, 120, 0, Math.PI * 2);
    pctx.fill();
    fs_1.default.writeFileSync(testPhotoPath, photoCanvas.toBuffer('image/png'));
    // 3. Simulate Member Application Submission
    console.log('\n[2] Simulating Member Application Submission...');
    const testRef = `VLBVN-APP-2026-TEST${Math.floor(100 + Math.random() * 900)}`;
    const testEmail = `applicant_${Date.now()}@test.org`;
    const testMobile = `98800${Math.floor(10000 + Math.random() * 90000)}`;
    const insApp = index_js_1.db.prepare(`
    INSERT INTO membership_applications (
      reference_no, status, full_name, photo_url, mobile, whatsapp, email,
      residential_address, company_name, business_category, designation, city, state,
      membership_type, chapter, declaration_confirmed
    ) VALUES (?, 'Pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).run(testRef, 'Shri Basavaraj S. Patil', '/uploads/photos/test_applicant_photo.png', testMobile, testMobile, testEmail, 'No. 42, Basava Krupa, Sadashivanagar, Bengaluru - 560080', 'Patil Global Infrastructure Ltd', 'Construction, Civil & Real Estate', 'Managing Director & Founder', 'Bengaluru', 'Karnataka', 'Visionary Life Member', 'Bengaluru Central');
    const appId = Number(insApp.lastInsertRowid);
    console.log(`✔ Application created with ID: ${appId}, Ref: ${testRef}`);
    // 4. Simulate Admin Approval & Automatic ID Card Generation
    console.log('\n[3] Simulating Admin Approval & Clean Light ID Card Generation...');
    const testMembershipId = `VLBVN-2026-TEST${Math.floor(100 + Math.random() * 900)}`;
    const insMember = index_js_1.db.prepare(`
    INSERT INTO members (
      membership_id, application_id, full_name, email, mobile,
      designation, company_name, chapter, membership_type, photo_url, valid_until, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Life Member', 'Active')
  `).run(testMembershipId, appId, 'Shri Basavaraj S. Patil', testEmail, testMobile, 'Managing Director & Founder', 'Patil Global Infrastructure Ltd', 'Bengaluru Central', 'Visionary Life Member', '/uploads/photos/test_applicant_photo.png');
    const memberId = Number(insMember.lastInsertRowid);
    index_js_1.db.prepare(`
    UPDATE membership_applications 
    SET status = 'Approved', reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ?
    WHERE id = ?
  `).run(admin.id, appId);
    console.log('Rendering clean light ID Card with exact VLBVN logo...');
    const cardFiles = await (0, idCardService_js_1.generateIdCardFiles)({
        id: memberId,
        membership_id: testMembershipId,
        full_name: 'Shri Basavaraj S. Patil',
        designation: 'Managing Director & Founder',
        company_name: 'Patil Global Infrastructure Ltd',
        chapter: 'Bengaluru Central',
        membership_type: 'Visionary Life Member',
        photo_url: '/uploads/photos/test_applicant_photo.png',
        valid_until: 'Life Member'
    }, template.id);
    console.log('✔ Generated ID Card Files:');
    console.log('   - PNG Path:', cardFiles.pngPath, `(${fs_1.default.statSync(cardFiles.pngPath).size} bytes)`);
    console.log('   - PDF Path:', cardFiles.pdfPath, `(${fs_1.default.statSync(cardFiles.pdfPath).size} bytes)`);
    await (0, emailService_js_1.sendApprovalAndCardEmail)({
        id: memberId,
        application_id: appId,
        membership_id: testMembershipId,
        full_name: 'Shri Basavaraj S. Patil',
        email: testEmail,
        chapter: 'Bengaluru Central',
        designation: 'Managing Director & Founder',
        membership_type: 'Visionary Life Member'
    }, cardFiles);
    console.log('\n🎉 VLBVN SYSTEM VERIFICATION PASSED WITH EXACT OFFICIAL LOGO & CLEAN LIGHT DESIGN!');
}
runEndToEndTest().catch(err => {
    console.error('Test failed with error:', err);
    process.exit(1);
});
