const express = require('express');
const router = express.Router();
const ModernUserController = require('../controllers/modern-user-controller');

// Middleware d'authentification simple
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ 
      status: 'ERROR',
      message: 'Token d\'authentification manquant' 
    });
  }
  // Validation simple du token (en production, utilisez une vraie validation JWT)
  req.userId = 'admin'; // Simulation
  next();
};

/**
 * Routes modernes pour la gestion des utilisateurs
 */

// POST /modern-users - Créer un utilisateur avec invitation par email
router.post('/', authenticate, ModernUserController.createUserWithInvitation);

// GET /modern-users/validate-token/:token - Valider un token de réinitialisation
router.get('/validate-token/:token', ModernUserController.validatePasswordResetToken);

// POST /modern-users/set-password/:token - Définir le mot de passe avec un token
router.post('/set-password/:token', ModernUserController.setPasswordWithToken);

// POST /modern-users/:userId/resend-invitation - Renvoyer une invitation
router.post('/:userId/resend-invitation', authenticate, ModernUserController.resendInvitation);

module.exports = router;