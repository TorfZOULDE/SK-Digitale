const db = require('../config/db');

const getActiveAnnouncements = async (req, res) => {
    try {
        // is_active est un BOOLEAN en PostgreSQL -> TRUE au lieu de 1
        const [rows] = await db.execute(
            'SELECT * FROM announcements WHERE is_active = TRUE ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

const getAllAnnouncements = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM announcements ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

const createAnnouncement = async (req, res) => {
    const { text, icon } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO announcements (text, icon) VALUES (?, ?) RETURNING id',
            [text, icon || 'fas fa-bullhorn']
        );
        res.status(201).json({ message: 'Annonce ajoutée', id: result[0].id });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

const toggleAnnouncement = async (req, res) => {
    try {
        // NOT is_active fonctionne pareil en PostgreSQL sur une colonne BOOLEAN
        await db.execute(
            'UPDATE announcements SET is_active = NOT is_active WHERE id = ?',
            [req.params.id]
        );
        res.json({ message: 'Statut modifié' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

const deleteAnnouncement = async (req, res) => {
    try {
        await db.execute('DELETE FROM announcements WHERE id = ?', [req.params.id]);
        res.json({ message: 'Annonce supprimée' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

module.exports = {
    getActiveAnnouncements,
    getAllAnnouncements,
    createAnnouncement,
    toggleAnnouncement,
    deleteAnnouncement
};