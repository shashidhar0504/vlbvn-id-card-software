import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PHOTOS_DIR, TEMPLATES_DIR } from '../config.js';

if (!fs.existsSync(PHOTOS_DIR)) fs.mkdirSync(PHOTOS_DIR, { recursive: true });
if (!fs.existsSync(TEMPLATES_DIR)) fs.mkdirSync(TEMPLATES_DIR, { recursive: true });

const photoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, PHOTOS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const unique = `photo_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, unique);
  }
});

const templateStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, TEMPLATES_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const unique = `template_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, unique);
  }
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image format. Only JPEG, PNG, and WebP are accepted.'));
  }
};

export const uploadPhoto = multer({
  storage: photoStorage,
  limits: { fileSize: 6 * 1024 * 1024 }, // 6MB
  fileFilter
});

export const uploadTemplate = multer({
  storage: templateStorage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter
});
