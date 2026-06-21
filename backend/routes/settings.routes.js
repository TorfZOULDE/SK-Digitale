const express = require('express');
const router  = express.Router();
const authMiddleware = require('../middlewares/auth');
const { getSettings, updateSettings } = require('../controllers/SettingsController');
const db = require('../config/db');

router.get('/', getSettings);
router.put('/', authMiddleware, updateSettings);

router.get('/system-status', authMiddleware, async (req, res) => {
    let dbStatus = false;
    try {
        await db.execute('SELECT 1');
        dbStatus = true;
    } catch (err) {
        dbStatus = false;
    }

    res.json({
        version: '1.0.0',
        nodeVersion: process.version,
        dbConnected: dbStatus,
        jwtActive: true
    });
});

module.exports = router;