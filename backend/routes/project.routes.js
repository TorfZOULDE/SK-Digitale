const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');
const db = require('../config/db');

const {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/ProjectController');

// ✅ Stockage en mémoire (pas sur disque) — le fichier est envoyé directement à Cloudinary.
// L'ancien multer.diskStorage écrivait sur le disque de Render, qui est effacé
// à chaque redéploiement -> c'était la cause des images cassées après un déploiement.
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }
});

// Envoie un buffer vers Cloudinary via un stream
const uploadToCloudinary = (buffer, folder, resourceType) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder, resource_type: resourceType },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

// ===================================
// ROUTES PUBLIQUES
// ===================================
router.get('/', getAllProjects);
router.get('/:id', getProject);

// ===================================
// ROUTES MÉDIAS
// ===================================
router.get('/:id/media', async (req, res) => {
    try {
        const [media] = await db.execute(
            'SELECT * FROM project_media WHERE project_id = ? ORDER BY id DESC',
            [req.params.id]
        );
        res.json(media);
    } catch (err) {
        console.error('❌ Erreur get media:', err);
        res.status(500).json({ message: 'Erreur', error: err.message });
    }
});

router.post('/:id/media', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        const { type } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier fourni' });
        }

        const [project] = await db.execute('SELECT id FROM projects WHERE id = ?', [req.params.id]);
        if (project.length === 0) {
            return res.status(404).json({ message: 'Projet introuvable' });
        }

        const resourceType = type === 'video' ? 'video' : 'image';
        const folder = `sk-digitale/projects/${type}s`;

        // Upload direct vers Cloudinary (le fichier n'est jamais écrit sur le disque)
        const result = await uploadToCloudinary(req.file.buffer, folder, resourceType);

        await db.execute(
            'INSERT INTO project_media (project_id, type, path, cloudinary_id) VALUES (?, ?, ?, ?)',
            [req.params.id, type, result.secure_url, result.public_id]
        );

        res.status(201).json({ message: 'Média ajouté avec succès', path: result.secure_url });
    } catch (err) {
        console.error('❌ Erreur upload:', err);
        res.status(500).json({ message: 'Erreur', error: err.message });
    }
});

router.delete('/:id/media/:mediaId', authMiddleware, async (req, res) => {
    try {
        const [media] = await db.execute(
            'SELECT cloudinary_id, type FROM project_media WHERE id = ? AND project_id = ?',
            [req.params.mediaId, req.params.id]
        );

        // Supprime aussi le fichier sur Cloudinary (sinon il reste orphelin là-bas)
        if (media.length > 0 && media[0].cloudinary_id) {
            const resourceType = media[0].type === 'video' ? 'video' : 'image';
            await cloudinary.uploader.destroy(media[0].cloudinary_id, { resource_type: resourceType });
        }

        await db.execute(
            'DELETE FROM project_media WHERE id = ? AND project_id = ?',
            [req.params.mediaId, req.params.id]
        );
        res.json({ message: 'Média supprimé' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur', error: err.message });
    }
});

// ===================================
// ROUTES PROTÉGÉES
// ===================================
router.post('/', authMiddleware, createProject);
router.put('/:id', authMiddleware, updateProject);
router.delete('/:id', authMiddleware, deleteProject);

module.exports = router;