const db = require('../config/db');

const getActiveAnnouncements = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM announcements WHERE is_active = 1 ORDER BY created_at DESC'
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
            'INSERT INTO announcements (text, icon) VALUES (?, ?)',
            [text, icon || 'fas fa-bullhorn']
        );
        res.status(201).json({ message: 'Annonce ajoutée', id: result.insertId });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

const toggleAnnouncement = async (req, res) => {
    try {
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
