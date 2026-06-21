const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const {
  trackVisitor,
  getAllVisitors,
  getStats
} = require('../controllers/VisitorController');

// Route publique — enregistrer un visiteur
router.post('/', trackVisitor);

// Routes protégées — admin seulement
router.get('/', authMiddleware, getAllVisitors);
router.get('/stats', authMiddleware, getStats);

module.exports = router;
