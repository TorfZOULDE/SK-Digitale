const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadMedia, getProjectMedia, deleteMedia } = require('../controllers/mediaController');

// On garde le fichier en mémoire (buffer) au lieu de l'écrire sur le disque,
// puis on l'envoie directement vers Cloudinary dans le contrôleur.
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB max
    },
    fileFilter: (req, file, cb) => {
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