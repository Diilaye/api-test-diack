const Formulaire = require('../models/formulaire');
const { validationResult } = require('express-validator');

class FormulaireSettingsController {
    
    /**
     * Récupérer les paramètres d'un formulaire
     */
    async getSettings(req, res) {
        try {
            const { id } = req.params;
            
            const formulaire = await Formulaire.findById(id);
            if (!formulaire) {
                return res.status(404).json({
                    success: false,
                    message: 'Formulaire non trouvé'
                });
            }

            // Vérifier les permissions
            if (formulaire.admin.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès refusé'
                });
            }

            // Initialiser les paramètres s'ils n'existent pas
            if (!formulaire.settings) {
                formulaire.settings = {
                    general: {
                        connectionRequired: false,
                        autoSave: true,
                        publicForm: false,
                        limitResponses: false,
                        maxResponses: 100,
                        anonymousResponses: false
                    },
                    notifications: {
                        enabled: true,
                        emailNotifications: true,
                        dailySummary: false
                    },
                    scheduling: {
                        startDate: null,
                        endDate: null,
                        timezone: 'Europe/Paris'
                    },
                    localization: {
                        language: 'fr',
                        timezone: 'Europe/Paris'
                    },
                    security: {
                        dataEncryption: true,
                        anonymousResponses: false
                    }
                };
                await formulaire.save();
            }

            res.json({
                success: true,
                data: formulaire.settings
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des paramètres:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    /**
     * Mettre à jour les paramètres généraux
     */
    async updateGeneralSettings(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { id } = req.params;
            const { connectionRequired, autoSave, publicForm, limitResponses, maxResponses, anonymousResponses } = req.body;

            const formulaire = await Formulaire.findById(id);
            if (!formulaire) {
                return res.status(404).json({
                    success: false,
                    message: 'Formulaire non trouvé'
                });
            }

            // Vérifier les permissions
            if (formulaire.admin.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès refusé'
                });
            }

            // Mettre à jour les paramètres généraux
            if (!formulaire.settings) {
                formulaire.settings = {};
            }
            if (!formulaire.settings.general) {
                formulaire.settings.general = {};
            }

            if (connectionRequired !== undefined) formulaire.settings.general.connectionRequired = connectionRequired;
            if (autoSave !== undefined) formulaire.settings.general.autoSave = autoSave;
            if (publicForm !== undefined) formulaire.settings.general.publicForm = publicForm;
            if (limitResponses !== undefined) formulaire.settings.general.limitResponses = limitResponses;
            if (maxResponses !== undefined) formulaire.settings.general.maxResponses = maxResponses;
            if (anonymousResponses !== undefined) formulaire.settings.general.anonymousResponses = anonymousResponses;

            await formulaire.save();

            res.json({
                success: true,
                message: 'Paramètres généraux mis à jour',
                data: formulaire.settings.general
            });

        } catch (error) {
            console.error('Erreur lors de la mise à jour des paramètres généraux:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    /**
     * Mettre à jour les paramètres de notification
     */
    async updateNotificationSettings(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { id } = req.params;
            const { enabled, emailNotifications, dailySummary } = req.body;

            const formulaire = await Formulaire.findById(id);
            if (!formulaire) {
                return res.status(404).json({
                    success: false,
                    message: 'Formulaire non trouvé'
                });
            }

            // Vérifier les permissions
            if (formulaire.admin.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès refusé'
                });
            }

            // Mettre à jour les paramètres de notification
            if (!formulaire.settings) {
                formulaire.settings = {};
            }
            if (!formulaire.settings.notifications) {
                formulaire.settings.notifications = {};
            }

            if (enabled !== undefined) formulaire.settings.notifications.enabled = enabled;
            if (emailNotifications !== undefined) formulaire.settings.notifications.emailNotifications = emailNotifications;
            if (dailySummary !== undefined) formulaire.settings.notifications.dailySummary = dailySummary;

            await formulaire.save();

            res.json({
                success: true,
                message: 'Paramètres de notification mis à jour',
                data: formulaire.settings.notifications
            });

        } catch (error) {
            console.error('Erreur lors de la mise à jour des paramètres de notification:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    /**
     * Mettre à jour les paramètres de planification
     */
    async updateSchedulingSettings(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { id } = req.params;
            const { startDate, endDate, timezone } = req.body;

            const formulaire = await Formulaire.findById(id);
            if (!formulaire) {
                return res.status(404).json({
                    success: false,
                    message: 'Formulaire non trouvé'
                });
            }

            // Vérifier les permissions
            if (formulaire.admin.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès refusé'
                });
            }

            // Valider les dates
            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                if (start >= end) {
                    return res.status(400).json({
                        success: false,
                        message: 'La date de fin doit être postérieure à la date de début'
                    });
                }
            }

            // Mettre à jour les paramètres de planification
            if (!formulaire.settings) {
                formulaire.settings = {};
            }
            if (!formulaire.settings.scheduling) {
                formulaire.settings.scheduling = {};
            }

            if (startDate !== undefined) formulaire.settings.scheduling.startDate = startDate ? new Date(startDate) : null;
            if (endDate !== undefined) formulaire.settings.scheduling.endDate = endDate ? new Date(endDate) : null;
            if (timezone !== undefined) formulaire.settings.scheduling.timezone = timezone;

            await formulaire.save();

            res.json({
                success: true,
                message: 'Paramètres de planification mis à jour',
                data: formulaire.settings.scheduling
            });

        } catch (error) {
            console.error('Erreur lors de la mise à jour des paramètres de planification:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    /**
     * Mettre à jour les paramètres de localisation
     */
    async updateLocalizationSettings(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { id } = req.params;
            const { language, timezone } = req.body;

            const formulaire = await Formulaire.findById(id);
            if (!formulaire) {
                return res.status(404).json({
                    success: false,
                    message: 'Formulaire non trouvé'
                });
            }

            // Vérifier les permissions
            if (formulaire.admin.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès refusé'
                });
            }

            // Mettre à jour les paramètres de localisation
            if (!formulaire.settings) {
                formulaire.settings = {};
            }
            if (!formulaire.settings.localization) {
                formulaire.settings.localization = {};
            }

            if (language !== undefined) formulaire.settings.localization.language = language;
            if (timezone !== undefined) formulaire.settings.localization.timezone = timezone;

            await formulaire.save();

            res.json({
                success: true,
                message: 'Paramètres de localisation mis à jour',
                data: formulaire.settings.localization
            });

        } catch (error) {
            console.error('Erreur lors de la mise à jour des paramètres de localisation:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    /**
     * Mettre à jour les paramètres de sécurité
     */
    async updateSecuritySettings(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { id } = req.params;
            const { dataEncryption, anonymousResponses } = req.body;

            const formulaire = await Formulaire.findById(id);
            if (!formulaire) {
                return res.status(404).json({
                    success: false,
                    message: 'Formulaire non trouvé'
                });
            }

            // Vérifier les permissions
            if (formulaire.admin.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès refusé'
                });
            }

            // Mettre à jour les paramètres de sécurité
            if (!formulaire.settings) {
                formulaire.settings = {};
            }
            if (!formulaire.settings.security) {
                formulaire.settings.security = {};
            }

            if (dataEncryption !== undefined) formulaire.settings.security.dataEncryption = dataEncryption;
            if (anonymousResponses !== undefined) formulaire.settings.security.anonymousResponses = anonymousResponses;

            await formulaire.save();

            res.json({
                success: true,
                message: 'Paramètres de sécurité mis à jour',
                data: formulaire.settings.security
            });

        } catch (error) {
            console.error('Erreur lors de la mise à jour des paramètres de sécurité:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    /**
     * Mettre à jour tous les paramètres en une seule fois
     */
    async updateAllSettings(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { id } = req.params;
            const { general, notifications, scheduling, localization, security } = req.body;

            const formulaire = await Formulaire.findById(id);
            if (!formulaire) {
                return res.status(404).json({
                    success: false,
                    message: 'Formulaire non trouvé'
                });
            }

            // Vérifier les permissions
            if (formulaire.admin.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès refusé'
                });
            }

            // Initialiser les paramètres s'ils n'existent pas
            if (!formulaire.settings) {
                formulaire.settings = {};
            }

            // Mettre à jour chaque section
            if (general) {
                formulaire.settings.general = { ...formulaire.settings.general, ...general };
            }
            if (notifications) {
                formulaire.settings.notifications = { ...formulaire.settings.notifications, ...notifications };
            }
            if (scheduling) {
                // Valider les dates
                if (scheduling.startDate && scheduling.endDate) {
                    const start = new Date(scheduling.startDate);
                    const end = new Date(scheduling.endDate);
                    if (start >= end) {
                        return res.status(400).json({
                            success: false,
                            message: 'La date de fin doit être postérieure à la date de début'
                        });
                    }
                }
                formulaire.settings.scheduling = { ...formulaire.settings.scheduling, ...scheduling };
            }
            if (localization) {
                formulaire.settings.localization = { ...formulaire.settings.localization, ...localization };
            }
            if (security) {
                formulaire.settings.security = { ...formulaire.settings.security, ...security };
            }

            await formulaire.save();

            res.json({
                success: true,
                message: 'Tous les paramètres ont été mis à jour',
                data: formulaire.settings
            });

        } catch (error) {
            console.error('Erreur lors de la mise à jour des paramètres:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    /**
     * Réinitialiser les paramètres aux valeurs par défaut
     */
    async resetSettings(req, res) {
        try {
            const { id } = req.params;

            const formulaire = await Formulaire.findById(id);
            if (!formulaire) {
                return res.status(404).json({
                    success: false,
                    message: 'Formulaire non trouvé'
                });
            }

            // Vérifier les permissions
            if (formulaire.admin.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès refusé'
                });
            }

            // Réinitialiser aux valeurs par défaut
            formulaire.settings = {
                general: {
                    connectionRequired: false,
                    autoSave: true,
                    publicForm: false,
                    limitResponses: false,
                    maxResponses: 100,
                    anonymousResponses: false
                },
                notifications: {
                    enabled: true,
                    emailNotifications: true,
                    dailySummary: false
                },
                scheduling: {
                    startDate: null,
                    endDate: null,
                    timezone: 'Europe/Paris'
                },
                localization: {
                    language: 'fr',
                    timezone: 'Europe/Paris'
                },
                security: {
                    dataEncryption: true,
                    anonymousResponses: false
                }
            };

            await formulaire.save();

            res.json({
                success: true,
                message: 'Paramètres réinitialisés aux valeurs par défaut',
                data: formulaire.settings
            });

        } catch (error) {
            console.error('Erreur lors de la réinitialisation des paramètres:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }
}

module.exports = new FormulaireSettingsController();
