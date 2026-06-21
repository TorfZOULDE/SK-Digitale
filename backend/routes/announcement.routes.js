const express = require('express');
const router  = express.Router();
const authMiddleware = require('../middlewares/auth');
const {
    getActiveAnnouncements,
    getAllAnnouncements,
    createAnnouncement,
    toggleAnnouncement,
    deleteAnnouncement
} = require('../controllers/AnnouncementController');

// Public
router.get('/active', getActiveAnnouncements);

// Admin
router.get('/', authMiddleware, getAllAnnouncements);
router.post('/', authMiddleware, createAnnouncement);
router.put('/:id/toggle', authMiddleware, toggleAnnouncement);
router.delete('/:id', authMiddleware, deleteAnnouncement);

module.exports = router;
