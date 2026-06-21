const express = require('express');
const router  = express.Router();
const authMiddleware = require('../middlewares/auth');
const {
    getAllExperiences,
    createExperience,
    updateExperience,
    deleteExperience
} = require('../controllers/ExperienceController');

// Route publique
router.get('/', getAllExperiences);

// Routes protégées — admin seulement
router.post('/',      authMiddleware, createExperience);
router.put('/:id',    authMiddleware, updateExperience);
router.delete('/:id', authMiddleware, deleteExperience);

module.exports = router;
