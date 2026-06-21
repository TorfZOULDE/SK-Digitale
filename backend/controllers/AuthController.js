const db     = require('../config/db');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwt');

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.execute(
            'SELECT * FROM admin WHERE username = ?', [username]
        );
        if (rows.length === 0)
            return res.status(401).json({ message: 'Identifiants incorrects' });

        const admin   = rows[0];
        const isValid = await bcrypt.compare(password, admin.password);
        if (!isValid)
            return res.status(401).json({ message: 'Identifiants incorrects' });

        const token = generateToken({ id: admin.id, username: admin.username });
        res.json({ message: 'Connexion réussie', token });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const [rows] = await db.execute(
            'SELECT * FROM admin WHERE id = ?', [req.admin.id]
        );
        if (rows.length === 0)
            return res.status(404).json({ message: 'Admin introuvable' });

        const admin   = rows[0];
        const isValid = await bcrypt.compare(currentPassword, admin.password);
        if (!isValid)
            return res.status(401).json({ message: 'Mot de passe actuel incorrect' });

        const hashed = await bcrypt.hash(newPassword, 10);
        await db.execute(
            'UPDATE admin SET password = ? WHERE id = ?', [hashed, req.admin.id]
        );
        res.json({ message: 'Mot de passe changé avec succès' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

const updateProfile = async (req, res) => {
    const { username } = req.body;
    try {
        await db.execute(
            'UPDATE admin SET username = ? WHERE id = ?',
            [username, req.admin.id]
        );
        res.json({ message: 'Profil mis à jour avec succès' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};
module.exports = { login, changePassword, updateProfile };