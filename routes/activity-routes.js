const express = require('express');
const router = express.Router();
const ActivityController = require('../controllers/activity-controller');

// Middleware d'authentification simple
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  // Validation simple du token (en production, utilisez une vraie validation JWT)
  req.userId = 'admin'; // Simulation
  next();
};

/**
 * Routes pour la gestion des activités
 */

// GET /activities/recent - Récupérer les activités récentes
router.get('/recent', authenticate, ActivityController.getRecentActivities);

// POST /activities - Créer une nouvelle activité
router.post('/', authenticate, ActivityController.createActivity);

// GET /activities/types - Récupérer les types d'activités disponibles
router.get('/types', authenticate, ActivityController.getActivityTypes);

// GET /activities/stats - Récupérer les statistiques des activités
router.get('/stats', authenticate, ActivityController.getActivityStats);

// GET /activities/by-type/:type - Récupérer les activités par type
router.get('/by-type/:type', authenticate, ActivityController.getActivitiesByType);

// GET /activities/by-user/:userId - Récupérer les activités par utilisateur
router.get('/by-user/:userId', authenticate, ActivityController.getActivitiesByUser);

// DELETE /activities/clear - Supprimer toutes les activités (admin seulement)
router.delete('/clear', authenticate, ActivityController.clearActivities);

module.exports = router;