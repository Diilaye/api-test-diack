const express = require('express');
const router = express.Router();
const exportController = require('../controllers/export-controller');

// Middleware d'authentification (optionnel, selon votre système)
// const authMiddleware = require('../midleweares/auth');

// Route pour exporter les réponses d'un formulaire spécifique en CSV
router.get('/formulaire/:formulaireId/responses', exportController.exportFormResponsesToCSV);

// Route pour exporter tous les formulaires en CSV
router.get('/formulaires', exportController.exportAllFormulairesToCSV);

// Route pour exporter tous les utilisateurs en CSV
router.get('/users', exportController.exportUsersToCSV);

module.exports = router;