const db = require('../config/db');

// Tous les projets
const getAllProjects = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Un seul projet
const getProject = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Projet introuvable' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Ajouter un projet
const createProject = async (req, res) => {
  const { title, short_description, full_description, technologies, github_url, demo_url, date } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO projects (title, short_description, full_description, technologies, github_url, demo_url, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, short_description, full_description, technologies, github_url, demo_url, date]
    );
    res.status(201).json({ message: 'Projet créé', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Modifier un projet
const updateProject = async (req, res) => {
  const { title, short_description, full_description, technologies, github_url, demo_url, date } = req.body;
  try {
    await db.execute(
      'UPDATE projects SET title=?, short_description=?, full_description=?, technologies=?, github_url=?, demo_url=?, date=? WHERE id=?',
      [title, short_description, full_description, technologies, github_url, demo_url, date, req.params.id]
    );
    res.json({ message: 'Projet modifié' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Supprimer un projet
const deleteProject = async (req, res) => {
  try {
    await db.execute('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ message: 'Projet supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

module.exports = { getAllProjects, getProject, createProject, updateProject, deleteProject };
