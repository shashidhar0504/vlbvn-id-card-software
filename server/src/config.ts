import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
export const JWT_SECRET = process.env.JWT_SECRET || 'vlpn_community_secure_jwt_secret_2026';
export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
export const PHOTOS_DIR = path.join(UPLOAD_DIR, 'photos');
export const TEMPLATES_DIR = path.join(UPLOAD_DIR, 'templates');
export const GENERATED_DIR = path.join(UPLOAD_DIR, 'generated');

export const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
