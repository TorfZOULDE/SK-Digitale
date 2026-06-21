const express    = require('express');
const router     = express.Router();
const auth       = require('../middlewares/auth');
const {
    getAllKnowledge,
    createKnowledge,
    updateKnowledge,
    deleteKnowledge
} = require('../controllers/AiController');

router.get('/knowledge',      auth, getAllKnowledge);
router.post('/knowledge',     auth, createKnowledge);
router.put('/knowledge/:id',  auth, updateKnowledge);
router.delete('/knowledge/:id', auth, deleteKnowledge);

module.exports = router;
