const db = require('../config/db');

// Tous les messages
const getAllMessages = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM messages ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Envoyer un message
const createMessage = async (req, res) => {
  const { name, email, subject, message } = req.body;
  try {
    await db.execute(
      'INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name, email, subject, message]
    );
    res.status(201).json({ message: 'Message envoyé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Marquer comme lu
const markAsRead = async (req, res) => {
  try {
    await db.execute('UPDATE messages SET is_read = TRUE WHERE id = ?', [req.params.id]);
    res.json({ message: 'Message marqué comme lu' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Archiver un message
const archiveMessage = async (req, res) => {
  try {
    await db.execute('UPDATE messages SET is_archived = TRUE WHERE id = ?', [req.params.id]);
    res.json({ message: 'Message archivé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Supprimer un message
const deleteMessage = async (req, res) => {
  try {
    await db.execute('DELETE FROM messages WHERE id = ?', [req.params.id]);
    res.json({ message: 'Message supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};


const { sendReplyEmail } = require('../config/email');

const replyMessage = async (req, res) => {
    const { reply } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM messages WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Message introuvable' });
        }

        const msg = rows[0];
        await sendReplyEmail(msg.email, msg.name, msg.subject, reply);

        // Marque comme lu
        await db.execute('UPDATE messages SET is_read = 1 WHERE id = ?', [req.params.id]);

        res.json({ message: 'Réponse envoyée avec succès' });
    } catch (err) {
        console.error('Erreur envoi email:', err);
        res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email', error: err.message });
    }
};

module.exports = { getAllMessages, createMessage, markAsRead, archiveMessage, deleteMessage,replyMessage };
