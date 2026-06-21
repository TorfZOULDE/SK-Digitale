const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const {
  getAllMessages,
  createMessage,
  markAsRead,
  archiveMessage,
  deleteMessage,
  replyMessage
} = require('../controllers/MessageController');

// Route publique — envoyer un message
router.post('/', createMessage);

// Routes protégées — admin seulement
router.get('/', authMiddleware, getAllMessages);
router.put('/:id/read', authMiddleware, markAsRead);
router.put('/:id/archive', authMiddleware, archiveMessage);
router.put('/:id/reply', authMiddleware, replyMessage);
router.delete('/:id', authMiddleware, deleteMessage);

module.exports = router;