"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_js_1 = require("../db/index.js");
const config_js_1 = require("../config.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        const admin = index_js_1.db.prepare('SELECT * FROM admins WHERE email = ?').get(email.trim().toLowerCase());
        if (!admin) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, admin.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        const token = jsonwebtoken_1.default.sign({
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role
        }, config_js_1.JWT_SECRET, { expiresIn: '7d' });
        return res.json({
            token,
            admin: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role
            }
        });
    }
    catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'An unexpected error occurred during login.' });
    }
});
router.get('/me', auth_js_1.requireAdmin, (req, res) => {
    return res.json({ admin: req.admin });
});
router.post('/change-password', auth_js_1.requireAdmin, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required.' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters.' });
        }
        const adminId = req.admin.id;
        const admin = index_js_1.db.prepare('SELECT * FROM admins WHERE id = ?').get(adminId);
        if (!admin) {
            return res.status(404).json({ error: 'Admin account not found.' });
        }
        const match = await bcryptjs_1.default.compare(currentPassword, admin.password_hash);
        if (!match) {
            return res.status(400).json({ error: 'Current password does not match.' });
        }
        const newHash = await bcryptjs_1.default.hash(newPassword, 10);
        index_js_1.db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(newHash, adminId);
        return res.json({ message: 'Password updated successfully.' });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
exports.default = router;
