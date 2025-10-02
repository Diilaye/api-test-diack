const activityModel = require('../models/activity-model');

/**
 * Contrôleur pour la gestion des activités
 */
class ActivityController {
  
  /**
   * Récupérer les activités récentes
   * GET /activities/recent
   */
  static async getRecentActivities(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;
      
      // Validation des paramètres
      if (limit > 100) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'La limite ne peut pas dépasser 100'
        });
      }

      const activities = activityModel.getRecent(limit, offset);
      const total = activityModel.getAll().length;
      
      res.json({
        status: 'OK',
        data: activities,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des activités:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erreur serveur lors de la récupération des activités'
      });
    }
  }

  /**
   * Créer une nouvelle activité
   * POST /activities
   */
  static async createActivity(req, res) {
    try {
      const { type, message, metadata } = req.body;
      
      // Validation des données
      if (!type || !message) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Type et message sont requis'
        });
      }

      // Types d'activités autorisés
      const allowedTypes = [
        'user_created', 'user_updated', 'user_deleted',
        'form_created', 'form_published', 'form_updated',
        'response_received', 'export_generated', 'login'
      ];

      if (!allowedTypes.includes(type)) {
        return res.status(400).json({
          status: 'ERROR',
          message: `Type d'activité non autorisé. Types autorisés: ${allowedTypes.join(', ')}`
        });
      }
      
      // Créer l'activité
      const newActivity = activityModel.create({
        type,
        message,
        userId: req.userId || 'anonymous',
        metadata: metadata || {}
      });
      
      res.status(201).json({
        status: 'OK',
        data: newActivity
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'activité:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erreur serveur lors de la création de l\'activité'
      });
    }
  }

  /**
   * Récupérer les types d'activités disponibles
   * GET /activities/types
   */
  static async getActivityTypes(req, res) {
    try {
      const types = [
        { 
          type: 'user_created', 
          description: 'Utilisateur créé',
          category: 'user',
          icon: 'person_add'
        },
        { 
          type: 'user_updated', 
          description: 'Utilisateur modifié',
          category: 'user',
          icon: 'person'
        },
        { 
          type: 'user_deleted', 
          description: 'Utilisateur supprimé',
          category: 'user',
          icon: 'person_remove'
        },
        { 
          type: 'form_created', 
          description: 'Formulaire créé',
          category: 'form',
          icon: 'description'
        },
        { 
          type: 'form_published', 
          description: 'Formulaire publié',
          category: 'form',
          icon: 'publish'
        },
        { 
          type: 'form_updated', 
          description: 'Formulaire modifié',
          category: 'form',
          icon: 'edit'
        },
        { 
          type: 'response_received', 
          description: 'Réponse reçue',
          category: 'response',
          icon: 'feedback'
        },
        { 
          type: 'export_generated', 
          description: 'Export généré',
          category: 'export',
          icon: 'download'
        },
        { 
          type: 'login', 
          description: 'Connexion utilisateur',
          category: 'authentication',
          icon: 'login'
        }
      ];
      
      res.json({
        status: 'OK',
        data: types
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des types:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erreur serveur lors de la récupération des types'
      });
    }
  }

  /**
   * Récupérer les statistiques des activités
   * GET /activities/stats
   */
  static async getActivityStats(req, res) {
    try {
      const stats = activityModel.getStats();
      
      res.json({
        status: 'OK',
        data: stats
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erreur serveur lors de la récupération des statistiques'
      });
    }
  }

  /**
   * Récupérer les activités par type
   * GET /activities/by-type/:type
   */
  static async getActivitiesByType(req, res) {
    try {
      const { type } = req.params;
      const limit = parseInt(req.query.limit) || 10;
      
      const activities = activityModel.getByType(type);
      const limitedActivities = activities.slice(0, limit);
      
      res.json({
        status: 'OK',
        data: limitedActivities,
        total: activities.length
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des activités par type:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erreur serveur lors de la récupération des activités'
      });
    }
  }

  /**
   * Récupérer les activités par utilisateur
   * GET /activities/by-user/:userId
   */
  static async getActivitiesByUser(req, res) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit) || 10;
      
      const activities = activityModel.getByUser(userId);
      const limitedActivities = activities.slice(0, limit);
      
      res.json({
        status: 'OK',
        data: limitedActivities,
        total: activities.length
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des activités par utilisateur:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erreur serveur lors de la récupération des activités'
      });
    }
  }

  /**
   * Supprimer toutes les activités (admin seulement)
   * DELETE /activities/clear
   */
  static async clearActivities(req, res) {
    try {
      // Vérification des permissions admin (à personnaliser selon votre système)
      if (req.userId !== 'admin') {
        return res.status(403).json({
          status: 'ERROR',
          message: 'Permissions insuffisantes'
        });
      }

      activityModel.clear();
      
      res.json({
        status: 'OK',
        message: 'Toutes les activités ont été supprimées'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression des activités:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erreur serveur lors de la suppression des activités'
      });
    }
  }
}

module.exports = ActivityController;