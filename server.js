const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./backend/config/db');

dotenv.config();

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('frontend', {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Sert les fichiers uploadés (images / vidéos des projets)
app.use('/uploads', express.static('uploads'));

const announcementRoutes = require('./backend/routes/announcement.routes');
app.use('/api/announcements', announcementRoutes);
// Test connexion base de données
db.getConnection()
  .then(() => console.log('✅ Connexion à MariaDB réussie'))
  .catch(err => console.error('❌ Erreur de connexion:', err.message));

// ===================================
// NETTOYAGE AUTO — Visiteurs de +30 jours
// ===================================
const cleanOldVisitors = async () => {
  try {
    const [result] = await db.execute(
      'DELETE FROM visitors WHERE visited_at < DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );
    if (result.affectedRows > 0) {
      console.log(`🧹 ${result.affectedRows} ancien(s) visiteur(s) supprimé(s)`);
    }
  } catch (err) {
    console.error('❌ Erreur nettoyage visiteurs:', err.message);
  }
};

// Exécute au démarrage puis toutes les 24h
cleanOldVisitors();
setInterval(cleanOldVisitors, 24 * 60 * 60 * 1000);  
// ===================================
// ROUTES
// ===================================

// Routes d'authentification
const authRoutes = require('./backend/routes/auth.routes');
app.use('/api/auth', authRoutes);

// Routes projets (inclut les médias)
const projectRoutes = require('./backend/routes/project.routes');
app.use('/api/projects', projectRoutes);

// Routes messages
const messageRoutes = require('./backend/routes/message.routes');
app.use('/api/messages', messageRoutes);

// Routes visiteurs
const visitorRoutes = require('./backend/routes/visitor.routes');
app.use('/api/visitors', visitorRoutes);

// Routes IA
const aiRoutes = require('./backend/routes/ai.routes');
app.use('/api/ai', aiRoutes);

// Routes expériences
const experienceRoutes = require('./backend/routes/experience.routes');
app.use('/api/experiences', experienceRoutes);
const settingsRoutes = require('./backend/routes/settings.routes');
app.use('/api/settings', settingsRoutes);
// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'Serveur portfolio opérationnel' });
});

// ===================================
// DÉMARRAGE DU SERVEUR
// ===================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📁 http://localhost:${PORT}`);
});