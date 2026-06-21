const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const db = require('../config/db');

const {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/ProjectController');

// ✅ Configuration Multer unifiée
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = file.mimetype.startsWith('image') ? 'images' : 'videos';
        const folder = `uploads/projects/${type}`;
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueName + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }
});

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
        const filePath = req.file.path;

        const [project] = await db.execute('SELECT id FROM projects WHERE id = ?', [req.params.id]);
        if (project.length === 0) {
            return res.status(404).json({ message: 'Projet introuvable' });
        }

        await db.execute(
            'INSERT INTO project_media (project_id, type, path) VALUES (?, ?, ?)',
            [req.params.id, type, filePath]
        );
        res.status(201).json({ message: 'Média ajouté avec succès', path: filePath });
    } catch (err) {
        console.error('❌ Erreur upload:', err);
        res.status(500).json({ message: 'Erreur', error: err.message });
    }
});

router.delete('/:id/media/:mediaId', authMiddleware, async (req, res) => {
    try {
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