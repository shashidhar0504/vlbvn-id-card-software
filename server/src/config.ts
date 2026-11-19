import path from 'path';
import os from 'os';
import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
export const JWT_SECRET = process.env.JWT_SECRET || 'vlpn_community_secure_jwt_secret_2026';

// On Vercel serverless environments, only tmp directory is writable at runtime
const isVercel = !!process.env.VERCEL;
export const UPLOAD_DIR = isVercel
  ? path.join(os.tmpdir(), 'uploads')
  : path.resolve(process.cwd(), 'uploads');
export const PHOTOS_DIR = path.join(UPLOAD_DIR, 'photos');
export const TEMPLATES_DIR = path.join(UPLOAD_DIR, 'templates');
export const GENERATED_DIR = path.join(UPLOAD_DIR, 'generated');

export const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// In Vercel Services, binding injects CLIENT_URL into process.env.CLIENT_URL
export const FRONTEND_URL =
  process.env.CLIENT_URL ||
  process.env.FRONTEND_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173');
