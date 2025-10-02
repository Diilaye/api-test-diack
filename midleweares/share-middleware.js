const Share = require('../models/share-model');
const bcrypt = require('bcryptjs');

/**
 * Middleware pour valider l'accès à un formulaire partagé
 */
async function validateShareAccess(req, res, next) {
  try {
    const { shareId } = req.params;
    const { password } = req.body;

    // Trouver le lien de partage
    const share = await Share.findOne({ shareId }).select('+settings.password');
    
    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Lien de partage non trouvé'
      });
    }

    // Vérifier si le lien est encore valide
    if (!share.isValid()) {
      return res.status(410).json({
        success: false,
        message: 'Ce lien de partage n\'est plus valide'
      });
    }

    // Vérifier si un mot de passe est requis
    if (share.settings.requirePassword) {
      if (!password) {
        return res.status(401).json({
          success: false,
          message: 'Mot de passe requis',
          requirePassword: true
        });
      }

      const isValidPassword = await bcrypt.compare(password, share.settings.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Mot de passe incorrect',
          requirePassword: true
        });
      }
    }

    // Ajouter les informations de partage à la requête
    req.share = share;
    next();

  } catch (error) {
    console.error('Erreur lors de la validation de l\'accès partagé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
}

/**
 * Middleware pour enregistrer une vue sur un lien de partage
 */
async function trackShareView(req, res, next) {
  try {
    if (req.share) {
      await req.share.incrementViews();
    }
    next();
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la vue:', error);
    // Ne pas bloquer la requête si l'enregistrement échoue
    next();
  }
}

/**
 * Middleware pour enregistrer une réponse sur un lien de partage
 */
async function trackShareResponse(req, res, next) {
  try {
    if (req.share) {
      await req.share.incrementResponses();
    }
    next();
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la réponse:', error);
    // Ne pas bloquer la requête si l'enregistrement échoue
    next();
  }
}

module.exports = {
  validateShareAccess,
  trackShareView,
  trackShareResponse
};
