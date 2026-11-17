# VLBVN Community – Digital Membership & ID Card Management System

**Veerashaiva Lingayat Business Visionary Network (VLBVN)**  
*Digital Membership Registration, Committee Scrutiny, ID Card Designer & Automated Dispatch Engine*

---

## 🌟 Key Updates
- **Official VLBVN Branding**: Correct acronym **VLBVN** (Veerashaiva Lingayat Business Visionary Network).
- **Exact Official Logo**: Integrated the exact high-resolution circular seal with Ishtalinga, golden lotus, handshake, and bilingual inscriptions.
- **Clean Light & Minimalist ID Card Theme**:
  - Crisp pearl-white / ivory gradient background (`#FFFFFF` to `#FBF9F5`).
  - Delicate hairline gold & bronze borders.
  - High-contrast, executive deep-slate typography for optimal legibility.
  - Prominent circular VLBVN official emblem.
  - Designated portrait photo frame and scan-to-verify QR code.
  - ISO/IEC 7810 CR80 standard card dimensions (1012 × 638 px).

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React Icons, Canvas Confetti.
- **Backend**: Node.js, Express, TypeScript, Native SQLite (`node:sqlite`).
- **ID Card Engine**: `@napi-rs/canvas` (300 DPI high-resolution rendering), `pdfkit` (ISO CR80 vector PDF), `qrcode` (instant cryptographic verification).
- **Email Service**: `nodemailer` (Live SMTP or Simulation fallback).

---

## 🚀 Quick Start Guide

### Start the Unified Server (Port 5000)
```bash
node start.js
```
Open **`http://localhost:5000`** in your browser.

---

## 🔐 Default Admin Credentials

- **Email**: `admin@vlpn.org`
- **Password**: `admin123`
*(Includes 1-click autofill on the login page)*

---

## 🧪 Run Automated Verification Test
```bash
cd server
pnpm run test:flow
```
Verifies full end-to-end pipeline: Registration ➔ Scrutiny ➔ Approval ➔ Sequential ID Generation ➔ Clean Light ID Card Render (PNG + PDF) with exact logo ➔ Email dispatch.
