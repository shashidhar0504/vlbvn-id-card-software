"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadTemplate = exports.uploadPhoto = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_js_1 = require("../config.js");
if (!fs_1.default.existsSync(config_js_1.PHOTOS_DIR))
    fs_1.default.mkdirSync(config_js_1.PHOTOS_DIR, { recursive: true });
if (!fs_1.default.existsSync(config_js_1.TEMPLATES_DIR))
    fs_1.default.mkdirSync(config_js_1.TEMPLATES_DIR, { recursive: true });
const photoStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, config_js_1.PHOTOS_DIR);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname) || '.jpg';
        const unique = `photo_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
        cb(null, unique);
    }
});
const templateStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, config_js_1.TEMPLATES_DIR);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname) || '.png';
        const unique = `template_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
        cb(null, unique);
    }
});
const fileFilter = (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid image format. Only JPEG, PNG, and WebP are accepted.'));
    }
};
exports.uploadPhoto = (0, multer_1.default)({
    storage: photoStorage,
    limits: { fileSize: 6 * 1024 * 1024 }, // 6MB
    fileFilter
});
exports.uploadTemplate = (0, multer_1.default)({
    storage: templateStorage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
    fileFilter
});
