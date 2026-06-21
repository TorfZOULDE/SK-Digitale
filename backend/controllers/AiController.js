const db = require('../config/db');

const getAllKnowledge = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM ai_knowledge ORDER BY category, created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

const createKnowledge = async (req, res) => {
    const { category, question, answer } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO ai_knowledge (category, question, answer) VALUES (?, ?, ?)',
            [category, question, answer]
        );
        res.status(201).json({ message: 'Connaissance ajoutée', id: result.insertId });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

const updateKnowledge = async (req, res) => {
    const { category, question, answer } = req.body;
    try {
        await db.execute(
            'UPDATE ai_knowledge SET category=?, question=?, answer=? WHERE id=?',
            [category, question, answer, req.params.id]
        );
        res.json({ message: 'Connaissance modifiée' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

const deleteKnowledge = async (req, res) => {
    try {
        await db.execute('DELETE FROM ai_knowledge WHERE id = ?', [req.params.id]);
        res.json({ message: 'Connaissance supprimée' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

module.exports = { getAllKnowledge, createKnowledge, updateKnowledge, deleteKnowledge };
