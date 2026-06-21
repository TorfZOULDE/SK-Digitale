const db = require('../config/db');

// Toutes les expériences
const getAllExperiences = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM experiences ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

// Ajouter une expérience
const createExperience = async (req, res) => {
    const { icon, title, company, date_range, tasks } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO experiences (icon, title, company, date_range, tasks) VALUES (?, ?, ?, ?, ?)',
            [icon, title, company, date_range, JSON.stringify(tasks)]
        );
        res.status(201).json({ message: 'Expérience ajoutée', id: result.insertId });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

// Modifier une expérience
const updateExperience = async (req, res) => {
    const { icon, title, company, date_range, tasks } = req.body;
    try {
        await db.execute(
            'UPDATE experiences SET icon=?, title=?, company=?, date_range=?, tasks=? WHERE id=?',
            [icon, title, company, date_range, JSON.stringify(tasks), req.params.id]
        );
        res.json({ message: 'Expérience modifiée' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

// Supprimer une expérience
const deleteExperience = async (req, res) => {
    try {
        await db.execute('DELETE FROM experiences WHERE id = ?', [req.params.id]);
        res.json({ message: 'Expérience supprimée' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

module.exports = { getAllExperiences, createExperience, updateExperience, deleteExperience };
