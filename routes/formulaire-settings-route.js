const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const formulaireSettingsController = require('../controllers/formulaire-settings');
const { checkManyRole } = require('../midleweares/auth');

// Middleware d'authentification pour toutes les routes
router.use(checkManyRole(['sondeur', 'agent']));

// Validation pour les paramètres généraux
const generalSettingsValidation = [
    body('connectionRequired').optional().isBoolean().withMessage('connectionRequired doit être un booléen'),
    body('autoSave').optional().isBoolean().withMessage('autoSave doit être un booléen'),
    body('publicForm').optional().isBoolean().withMessage('publicForm doit être un booléen'),
    body('limitResponses').optional().isBoolean().withMessage('limitResponses doit être un booléen'),
    body('maxResponses').optional().isInt({ min: 1, max: 10000 }).withMessage('maxResponses doit être un nombre entre 1 et 10000'),
    body('anonymousResponses').optional().isBoolean().withMessage('anonymousResponses doit être un booléen')
];

// Validation pour les paramètres de notification
const notificationSettingsValidation = [
    body('enabled').optional().isBoolean().withMessage('enabled doit être un booléen'),
    body('emailNotifications').optional().isBoolean().withMessage('emailNotifications doit être un booléen'),
    body('dailySummary').optional().isBoolean().withMessage('dailySummary doit être un booléen')
];

// Validation pour les paramètres de planification
const schedulingSettingsValidation = [
    body('startDate').optional().isISO8601().withMessage('startDate doit être une date valide'),
    body('endDate').optional().isISO8601().withMessage('endDate doit être une date valide'),
    body('timezone').optional().isString().withMessage('timezone doit être une chaîne de caractères')
];

// Validation pour les paramètres de localisation
const localizationSettingsValidation = [
    body('language').optional().isIn(['fr', 'en', 'es']).withMessage('language doit être fr, en ou es'),
    body('timezone').optional().isString().withMessage('timezone doit être une chaîne de caractères')
];

// Validation pour les paramètres de sécurité
const securitySettingsValidation = [
    body('dataEncryption').optional().isBoolean().withMessage('dataEncryption doit être un booléen'),
    body('anonymousResponses').optional().isBoolean().withMessage('anonymousResponses doit être un booléen')
];

// Routes pour les paramètres du formulaire

/**
 * @route GET /api/v1/formulaire-settings/:id
 * @desc Récupérer tous les paramètres d'un formulaire
 * @access Private
 */
router.get('/:id', formulaireSettingsController.getSettings);

/**
 * @route PUT /api/v1/formulaire-settings/:id/general
 * @desc Mettre à jour les paramètres généraux
 * @access Private
 */
router.put('/:id/general', generalSettingsValidation, formulaireSettingsController.updateGeneralSettings);

/**
 * @route PUT /api/v1/formulaire-settings/:id/notifications
 * @desc Mettre à jour les paramètres de notification
 * @access Private
 */
router.put('/:id/notifications', notificationSettingsValidation, formulaireSettingsController.updateNotificationSettings);

/**
 * @route PUT /api/v1/formulaire-settings/:id/scheduling
 * @desc Mettre à jour les paramètres de planification
 * @access Private
 */
router.put('/:id/scheduling', schedulingSettingsValidation, formulaireSettingsController.updateSchedulingSettings);

/**
 * @route PUT /api/v1/formulaire-settings/:id/localization
 * @desc Mettre à jour les paramètres de localisation
 * @access Private
 */
router.put('/:id/localization', localizationSettingsValidation, formulaireSettingsController.updateLocalizationSettings);

/**
 * @route PUT /api/v1/formulaire-settings/:id/security
 * @desc Mettre à jour les paramètres de sécurité
 * @access Private
 */
router.put('/:id/security', securitySettingsValidation, formulaireSettingsController.updateSecuritySettings);

/**
 * @route PUT /api/v1/formulaire-settings/:id/all
 * @desc Mettre à jour tous les paramètres en une seule fois
 * @access Private
 */
router.put('/:id/all', [
    // Validation pour toutes les sections
    body('general.connectionRequired').optional().isBoolean(),
    body('general.autoSave').optional().isBoolean(),
    body('general.publicForm').optional().isBoolean(),
    body('general.limitResponses').optional().isBoolean(),
    body('general.maxResponses').optional().isInt({ min: 1, max: 10000 }),
    body('general.anonymousResponses').optional().isBoolean(),
    
    body('notifications.enabled').optional().isBoolean(),
    body('notifications.emailNotifications').optional().isBoolean(),
    body('notifications.dailySummary').optional().isBoolean(),
    
    body('scheduling.startDate').optional().isISO8601(),
    body('scheduling.endDate').optional().isISO8601(),
    body('scheduling.timezone').optional().isString(),
    
    body('localization.language').optional().isIn(['fr', 'en', 'es']),
    body('localization.timezone').optional().isString(),
    
    body('security.dataEncryption').optional().isBoolean(),
    body('security.anonymousResponses').optional().isBoolean()
], formulaireSettingsController.updateAllSettings);

/**
 * @route POST /api/v1/formulaire-settings/:id/reset
 * @desc Réinitialiser les paramètres aux valeurs par défaut
 * @access Private
 */
router.post('/:id/reset', formulaireSettingsController.resetSettings);

module.exports = router;
