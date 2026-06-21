const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { uploadMedia, getProjectMedia, deleteMedia } = require('../controllers/mediaController');

// Configuration de Multer pour l'upload temporaire
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const tempDir = 'uploads/temp';
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB max
    },
    fileFilter: (req, file, cb) => {
        // Accepter images et vidéos
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Type de fichier non supporté'), false);
        }
    }
});

// Routes
router.post('/projects/:id/media', upload.single('file'), uploadMedia);
router.get('/projects/:id/media', getProjectMedia);
router.delete('/media/:mediaId', deleteMedia);

module.exports = router;