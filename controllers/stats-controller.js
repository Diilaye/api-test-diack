const User = require('../models/user');
const Formulaire = require('../models/formulaire');
const ResponseFormulaire = require('../models/response-formulaire');

class StatsController {
  /**
   * GET /stats/general
   * Récupérer les statistiques générales du système
   */
  static async getGeneralStats(req, res) {
    try {
      // Statistiques des utilisateurs
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ 
        lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      });
      const usersByType = await User.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]);

      // Statistiques des formulaires
      const totalFormulaires = await Formulaire.countDocuments();
      const activeFormulaires = await Formulaire.countDocuments({ 
        blocked: { $ne: true } 
      });
      const blockedFormulaires = await Formulaire.countDocuments({ 
        blocked: true 
      });

      // Statistiques des réponses
      const totalResponses = await ResponseFormulaire.countDocuments();
      const responsesToday = await ResponseFormulaire.countDocuments({
        createdAt: { 
          $gte: new Date(new Date().setHours(0, 0, 0, 0)) 
        }
      });
      const responsesThisWeek = await ResponseFormulaire.countDocuments({
        createdAt: { 
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
        }
      });

      // Formulaires les plus populaires
      const popularFormulaires = await ResponseFormulaire.aggregate([
        { $group: { 
          _id: '$formulaireId', 
          responseCount: { $sum: 1 } 
        }},
        { $sort: { responseCount: -1 } },
        { $limit: 5 },
        { $lookup: {
          from: 'formulaires',
          localField: '_id',
          foreignField: '_id',
          as: 'formulaire'
        }},
        { $unwind: '$formulaire' },
        { $project: {
          formulaireId: '$_id',
          title: '$formulaire.title',
          responseCount: 1
        }}
      ]);

      const stats = {
        users: {
          total: totalUsers,
          active: activeUsers,
          byType: usersByType.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        },
        formulaires: {
          total: totalFormulaires,
          active: activeFormulaires,
          blocked: blockedFormulaires
        },
        responses: {
          total: totalResponses,
          today: responsesToday,
          thisWeek: responsesThisWeek
        },
        popularFormulaires,
        lastUpdated: new Date()
      };

      res.status(200).json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Erreur StatsController.getGeneralStats:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques générales',
        error: error.message
      });
    }
  }

  /**
   * GET /stats/dashboard
   * Récupérer les statistiques pour le dashboard admin
   */
  static async getDashboardStats(req, res) {
    try {
      // Statistiques rapides pour le dashboard
      const [
        totalUsers,
        totalFormulaires,
        totalResponses,
        recentResponses
      ] = await Promise.all([
        User.countDocuments(),
        Formulaire.countDocuments(),
        ResponseFormulaire.countDocuments(),
        ResponseFormulaire.countDocuments({
          createdAt: { 
            $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) 
          }
        })
      ]);

      const stats = {
        totalUsers,
        totalFormulaires,
        totalResponses,
        recentResponses,
        lastUpdated: new Date()
      };

      res.status(200).json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Erreur StatsController.getDashboardStats:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques du dashboard',
        error: error.message
      });
    }
  }
}

module.exports = StatsController;