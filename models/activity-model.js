/**
 * Modèle pour la gestion des activités
 * Utilise une base de données en mémoire pour la démonstration
 * En production, remplacez par une vraie base de données (MongoDB, MySQL, etc.)
 */

class ActivityModel {
  constructor() {
    this.activities = [];
    this.nextId = 1;
  }

  /**
   * Créer une nouvelle activité
   * @param {Object} activityData - Données de l'activité
   * @returns {Object} Nouvelle activité créée
   */
  create(activityData) {
    const activity = {
      id: this.nextId++,
      type: activityData.type,
      message: activityData.message,
      userId: activityData.userId,
      timestamp: new Date().toISOString(),
      metadata: activityData.metadata || {}
    };

    this.activities.unshift(activity); // Ajouter au début pour garder l'ordre chronologique
    
    // Garder seulement les 1000 dernières activités pour éviter la surcharge mémoire
    if (this.activities.length > 1000) {
      this.activities = this.activities.slice(0, 1000);
    }

    return activity;
  }

  /**
   * Récupérer les activités récentes
   * @param {number} limit - Nombre maximum d'activités à retourner
   * @param {number} offset - Décalage pour la pagination
   * @returns {Array} Liste des activités
   */
  getRecent(limit = 10, offset = 0) {
    return this.activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(offset, offset + limit);
  }

  /**
   * Récupérer toutes les activités
   * @returns {Array} Liste de toutes les activités
   */
  getAll() {
    return this.activities;
  }

  /**
   * Récupérer les activités par type
   * @param {string} type - Type d'activité
   * @returns {Array} Liste des activités du type spécifié
   */
  getByType(type) {
    return this.activities.filter(activity => activity.type === type);
  }

  /**
   * Récupérer les activités par utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @returns {Array} Liste des activités de l'utilisateur
   */
  getByUser(userId) {
    return this.activities.filter(activity => activity.userId === userId);
  }

  /**
   * Récupérer les statistiques des activités
   * @returns {Object} Statistiques des activités
   */
  getStats() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const activities24h = this.activities.filter(a => new Date(a.timestamp) > last24h);
    const activities7days = this.activities.filter(a => new Date(a.timestamp) > last7days);

    const typeStats = this.activities.reduce((stats, activity) => {
      stats[activity.type] = (stats[activity.type] || 0) + 1;
      return stats;
    }, {});

    return {
      total: this.activities.length,
      last24h: activities24h.length,
      last7days: activities7days.length,
      byType: typeStats,
      mostActive: Object.entries(typeStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([type, count]) => ({ type, count }))
    };
  }

  /**
   * Supprimer une activité
   * @param {number} id - ID de l'activité à supprimer
   * @returns {boolean} True si supprimé, false si non trouvé
   */
  delete(id) {
    const index = this.activities.findIndex(activity => activity.id === id);
    if (index !== -1) {
      this.activities.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Vider toutes les activités
   */
  clear() {
    this.activities = [];
    this.nextId = 1;
  }

  /**
   * Initialiser avec des données de démonstration
   */
  initWithSampleData() {
    const sampleActivities = [
      {
        type: 'user_created',
        message: 'Nouvel utilisateur admin créé',
        userId: 'admin',
        metadata: {
          username: 'admin',
          email: 'admin@example.com',
          userType: 'administrateur'
        }
      },
      {
        type: 'form_created',
        message: 'Formulaire "Enquête satisfaction" créé',
        userId: 'admin',
        metadata: {
          formId: 'form123',
          formTitle: 'Enquête satisfaction'
        }
      },
      {
        type: 'response_received',
        message: '15 nouvelles réponses reçues',
        userId: 'system',
        metadata: {
          responseCount: 15,
          formId: 'form123'
        }
      },
      {
        type: 'user_updated',
        message: 'Profil utilisateur jane_doe modifié',
        userId: 'admin',
        metadata: {
          targetUserId: 'user456',
          updatedFields: ['email', 'nom']
        }
      },
      {
        type: 'export_generated',
        message: 'Export CSV des utilisateurs généré',
        userId: 'admin',
        metadata: {
          exportType: 'users',
          fileName: 'users_export.csv',
          userCount: 25
        }
      }
    ];

    // Ajouter les activités avec des timestamps variés
    sampleActivities.forEach((activity, index) => {
      const hoursAgo = (index + 1) * 2; // 2h, 4h, 6h, etc.
      const timestamp = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
      
      this.activities.push({
        id: this.nextId++,
        ...activity,
        timestamp: timestamp.toISOString()
      });
    });
  }
}

// Instance singleton pour la démonstration
const activityModel = new ActivityModel();

// Initialiser avec des données de démonstration
activityModel.initWithSampleData();

module.exports = activityModel;