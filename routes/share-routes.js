const express = require('express');
const router = express.Router();
const shareController = require('../controllers/share-controller');
const { checkManyRole } = require('../midleweares/auth');
const { body, param } = require('express-validator');
const Share = require('../models/share-model');

// Validation personnalisée pour vérifier si l'URL de partage existe
const validateShareUrl = async (value) => {
  const share = await Share.findOne({ shareUrl: value });
  if (!share) {
    throw new Error('URL de partage introuvable');
  }
  return true;
};

// Validation pour la génération de lien
const generateShareValidation = [
  body('formulaireId').isMongoId().withMessage('ID de formulaire invalide'),
  body('requirePassword').optional().isBoolean().withMessage('requirePassword doit être un booléen'),
  body('customPassword').optional().isString().withMessage('Le mot de passe doit être une chaîne'),
  body('expiryDate').optional().isISO8601().withMessage('Date d\'expiration invalide'),
  body('maxUses').optional().isInt({ min: 1 }).withMessage('Le nombre maximal d\'utilisations doit être un entier positif'),
  body('isPublic').optional().isBoolean().withMessage('isPublic doit être un booléen')
];

// Validation pour l'envoi d'email
const sendEmailValidation = [
  body('formulaireId').isMongoId().withMessage('ID de formulaire invalide'),
  body('shareUrl').isURL().withMessage('Format d\'URL invalide').custom(validateShareUrl),
  body('recipients').isArray({ min: 1 }).withMessage('Au moins un destinataire requis'),
  body('recipients.*').isEmail().withMessage('Adresse email invalide'),
  body('subject').optional().isString().withMessage('Le sujet doit être une chaîne'),
  body('message').optional().isString().withMessage('Le message doit être une chaîne'),
  body('password').optional().isString().withMessage('Le mot de passe doit être une chaîne'),
  body('includePassword').optional().isBoolean().withMessage('includePassword doit être un booléen')
];

// Validation pour la programmation d'email
const scheduleEmailValidation = [
  body('formulaireId').isMongoId().withMessage('ID de formulaire invalide'),
  body('shareUrl').isURL().withMessage('Format d\'URL invalide').custom(validateShareUrl),
  body('recipients').isArray({ min: 1 }).withMessage('Au moins un destinataire requis'),
  body('recipients.*').isEmail().withMessage('Adresse email invalide'),
  body('scheduledDate').isISO8601().withMessage('Date programmée invalide'),
  body('subject').optional().isString().withMessage('Le sujet doit être une chaîne'),
  body('message').optional().isString().withMessage('Le message doit être une chaîne'),
  body('password').optional().isString().withMessage('Le mot de passe doit être une chaîne'),
  body('includePassword').optional().isBoolean().withMessage('includePassword doit être un booléen'),
  body('recurring').optional().isBoolean().withMessage('recurring doit être un booléen'),
  body('recurringPattern').optional().isIn(['daily', 'weekly', 'monthly']).withMessage('Pattern de récurrence invalide')
];

// Validation pour la validation de mot de passe
const validatePasswordValidation = [
  body('shareId').isUUID().withMessage('ID de partage invalide'),
  body('password').isString().withMessage('Mot de passe requis')
];

// Routes protégées pour les sondeurs et agents
router.post('/generate', checkManyRole(['sondeur', 'agent']), generateShareValidation, shareController.generateShare);
router.post('/send-email', checkManyRole(['sondeur', 'agent']), shareController.sendEmail);
router.post('/schedule-email', checkManyRole(['sondeur', 'agent']), scheduleEmailValidation, shareController.scheduleEmail);
router.get('/stats/:formulaireId', checkManyRole(['sondeur', 'agent']), param('formulaireId').isMongoId(), shareController.getStats);
router.get('/active/:formulaireId', checkManyRole(['sondeur', 'agent']), param('formulaireId').isMongoId(), shareController.getActiveLinks);
router.delete('/revoke/:shareId', checkManyRole(['sondeur', 'agent']), param('shareId').isMongoId(), shareController.revokeLink);

// Routes publiques pour l'accès aux formulaires partagés
router.get('/details/:shareId', param('shareId').isUUID(), shareController.getShareDetails);
router.get('/access/:shareId', param('shareId').isUUID(), shareController.accessForm);
router.post('/validate-password', validatePasswordValidation, shareController.validatePassword);
router.post('/submit-response', [
  body('shareId').isUUID().withMessage('ID de partage invalide'),
  body('responses').isObject().withMessage('Réponses requises')
], shareController.submitResponse);

module.exports = router;
