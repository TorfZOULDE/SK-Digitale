const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Upload d'un média (image ou vidéo)
const uploadMedia = async (req, res) => {
    try {
        const projectId = req.params.id;
        const { type } = req.body; // 'image' ou 'video'
        
        // Vérifier que le fichier existe
        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier fourni' });
        }

        console.log('📁 Fichier reçu:', req.file.originalname);
        console.log('📁 Type:', type);
        console.log('📁 Chemin temporaire:', req.file.path);

        // Vérifier que le projet existe
        const [project] = await db.execute('SELECT id FROM projects WHERE id = ?', [projectId]);
        if (project.length === 0) {
            return res.status(404).json({ message: 'Projet introuvable' });
        }

        // Déterminer le dossier en fonction du type
        const folder = type === 'video' ? 'uploads/projects/videos' : 'uploads/projects/images';
        
        // Créer le dossier s'il n'existe pas
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
            console.log('📁 Dossier créé:', folder);
        }

        // Déplacer le fichier vers le bon dossier
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;
        const filePath = path.join(folder, fileName);
        
        // ✅ Vérifier que le fichier temporaire existe avant de le déplacer
        if (!fs.existsSync(req.file.path)) {
            return res.status(500).json({ message: 'Fichier temporaire introuvable' });
        }
        
        // ✅ Déplacer le fichier
        fs.renameSync(req.file.path, filePath);
        console.log('✅ Fichier déplacé vers:', filePath);

        // Enregistrer en base de données
        const [result] = await db.execute(
            'INSERT INTO project_media (project_id, type, path) VALUES (?, ?, ?)',
            [projectId, type, `/uploads/projects/${type}s/${fileName}`]
        );

        res.status(201).json({
            message: 'Média uploadé avec succès',
            mediaId: result.insertId,
            path: `/uploads/projects/${type}s/${fileName}`
        });
    } catch (err) {
        console.error('❌ Erreur upload média:', err);
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

// Récupérer tous les médias d'un projet
const getProjectMedia = async (req, res) => {
    try {
        const projectId = req.params.id;
        
        const [media] = await db.execute(
            'SELECT * FROM project_media WHERE project_id = ? ORDER BY created_at DESC',
            [projectId]
        );
        res.json(media);
    } catch (err) {
        console.error('❌ Erreur getProjectMedia:', err);
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

// Supprimer un média
const deleteMedia = async (req, res) => {
    try {
        const mediaId = req.params.mediaId;
        
        const [media] = await db.execute('SELECT path FROM project_media WHERE id = ?', [mediaId]);
        if (media.length === 0) {
            return res.status(404).json({ message: 'Média introuvable' });
        }

        // Supprimer le fichier du disque
        const filePath = path.join(__dirname, '..', media[0].path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('🗑️ Fichier supprimé:', filePath);
        }

        // Supprimer de la base de données
        await db.execute('DELETE FROM project_media WHERE id = ?', [mediaId]);
        
        res.json({ message: 'Média supprimé avec succès' });
    } catch (err) {
        console.error('❌ Erreur deleteMedia:', err);
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

module.exports = { uploadMedia, getProjectMedia, deleteMedia };