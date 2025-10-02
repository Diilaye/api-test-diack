const express = require('express');
const router = express.Router();
const StatsController = require('../controllers/stats-controller');
const { checkRole, checkManyRole } = require('../midleweares/auth');

// GET /stats/general - Récupérer les statistiques générales (admin uniquement)
router.get('/general', checkRole('admin'), StatsController.getGeneralStats);

// GET /stats/dashboard - Récupérer les statistiques du dashboard (admin uniquement)
router.get('/dashboard', checkRole('admin'), StatsController.getDashboardStats);

module.exports = router;