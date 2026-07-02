const db = require('../config/db');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Fonction utilitaire : envoie un buffer vers Cloudinary via un stream
const uploadToCloudinary = (buffer, folder, resourceType) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: resourceType // 'image' ou 'video'
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

// Upload d'un média (image ou vidéo)
const uploadMedia = async (req, res) => {
    try {
        const projectId = req.params.id;
        const { type } = req.body; // 'image' ou 'video'

        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier fourni' });
        }

        console.log('📁 Fichier reçu:', req.file.originalname);
        console.log('📁 Type:', type);

        // Vérifier que le projet existe
        const [project] = await db.execute('SELECT id FROM projects WHERE id = ?', [projectId]);
        if (project.length === 0) {
            return res.status(404).json({ message: 'Projet introuvable' });
        }

        const resourceType = type === 'video' ? 'video' : 'image';
        const folder = `sk-digitale/projects/${type}s`;

        // Upload direct vers Cloudinary (le fichier n'est jamais écrit sur le disque)
        const result = await uploadToCloudinary(req.file.buffer, folder, resourceType);
        console.log('✅ Uploadé sur Cloudinary:', result.secure_url);

        // Enregistrer en base de données (on stocke l'URL complète + le public_id pour pouvoir supprimer plus tard)
        const [dbResult] = await db.execute(
            'INSERT INTO project_media (project_id, type, path, cloudinary_id) VALUES (?, ?, ?, ?)',
            [projectId, type, result.secure_url, result.public_id]
        );

        res.status(201).json({
            message: 'Média uploadé avec succès',
            mediaId: dbResult.insertId,
            path: result.secure_url
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

        const [media] = await db.execute('SELECT cloudinary_id, type FROM project_media WHERE id = ?', [mediaId]);
        if (media.length === 0) {
            return res.status(404).json({ message: 'Média introuvable' });
        }

        // Supprimer le fichier sur Cloudinary
        if (media[0].cloudinary_id) {
            const resourceType = media[0].type === 'video' ? 'video' : 'image';
            await cloudinary.uploader.destroy(media[0].cloudinary_id, { resource_type: resourceType });
            console.log('🗑️ Fichier supprimé de Cloudinary:', media[0].cloudinary_id);
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