const db = require('../config/db');

// Enregistrer un visiteur
const trackVisitor = async (req, res) => {
  const { page } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const browser = req.headers['user-agent'];

  try {
    await db.execute(
      'INSERT INTO visitors (ip, browser, page) VALUES (?, ?, ?)',
      [ip, browser, page]
    );
    res.status(201).json({ message: 'Visiteur enregistré' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Tous les visiteurs
const getAllVisitors = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM visitors ORDER BY visited_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Statistiques
const getStats = async (req, res) => {
  try {
    const [[{ total_visitors }]] = await db.execute('SELECT COUNT(*) as total_visitors FROM visitors');
    const [[{ total_messages }]] = await db.execute('SELECT COUNT(*) as total_messages FROM messages');
    const [[{ total_projects }]] = await db.execute('SELECT COUNT(*) as total_projects FROM projects');

    // PostgreSQL renvoie COUNT(*) comme une chaîne de caractères (type bigint),
    // contrairement à MySQL qui renvoie un nombre. On force la conversion pour
    // éviter des bugs côté frontend si ces valeurs sont utilisées dans des calculs.
    res.json({
      total_visitors: parseInt(total_visitors, 10),
      total_messages: parseInt(total_messages, 10),
      total_projects: parseInt(total_projects, 10)
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

module.exports = { trackVisitor, getAllVisitors, getStats };