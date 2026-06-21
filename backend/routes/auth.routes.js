const express = require('express');
const router  = express.Router();
const { login, changePassword, updateProfile } = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/auth');

router.post('/login', login);
router.put('/change-password', authMiddleware, changePassword);
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;