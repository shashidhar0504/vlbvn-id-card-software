"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FRONTEND_URL = exports.BASE_URL = exports.GENERATED_DIR = exports.TEMPLATES_DIR = exports.PHOTOS_DIR = exports.UPLOAD_DIR = exports.JWT_SECRET = exports.PORT = void 0;
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
exports.JWT_SECRET = process.env.JWT_SECRET || 'vlpn_community_secure_jwt_secret_2026';
// On Vercel serverless environments, only tmp directory is writable at runtime
const isVercel = !!process.env.VERCEL;
exports.UPLOAD_DIR = isVercel
    ? path_1.default.join(os_1.default.tmpdir(), 'uploads')
    : path_1.default.resolve(process.cwd(), 'uploads');
exports.PHOTOS_DIR = path_1.default.join(exports.UPLOAD_DIR, 'photos');
exports.TEMPLATES_DIR = path_1.default.join(exports.UPLOAD_DIR, 'templates');
exports.GENERATED_DIR = path_1.default.join(exports.UPLOAD_DIR, 'generated');
exports.BASE_URL = process.env.BASE_URL || `http://localhost:${exports.PORT}`;
// In Vercel Services, binding injects CLIENT_URL into process.env.CLIENT_URL
exports.FRONTEND_URL = process.env.CLIENT_URL ||
    process.env.FRONTEND_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173');
