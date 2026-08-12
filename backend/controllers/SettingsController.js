const db = require('../config/db');

const getSettings = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM site_settings WHERE id = 1');
        if (rows.length === 0) {
            return res.json({ default_theme: 'dark', primary_color: '#ff6b35' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

const updateSettings = async (req, res) => {
    const { default_theme, primary_color } = req.body;
    try {
        // Postgres n'a pas de "ON UPDATE CURRENT_TIMESTAMP" automatique comme MySQL,
        // donc on met à jour updated_at explicitement ici.
        await db.execute(
            'UPDATE site_settings SET default_theme = ?, primary_color = ?, updated_at = NOW() WHERE id = 1',
            [default_theme, primary_color]
        );
        res.json({ message: 'Réglages mis à jour avec succès' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

module.exports = { getSettings, updateSettings };