const Formulaire = require('../models/formulaire');

/**
 * Middleware pour vérifier les paramètres du formulaire avant la soumission
 */
async function checkFormulaireSettings(req, res, next) {
    try {
        const { formulaireId } = req.params;
        
        // Récupérer le formulaire avec ses paramètres
        const formulaire = await Formulaire.findById(formulaireId);
        
        if (!formulaire) {
            return res.status(404).json({
                success: false,
                message: 'Formulaire non trouvé'
            });
        }

        // Vérifier si le formulaire est archivé ou supprimé
        if (formulaire.archived === '1' || formulaire.deleted === '1') {
            return res.status(403).json({
                success: false,
                message: 'Ce formulaire n\'est plus accessible'
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
                scheduling: {
                    startDate: null,
                    endDate: null,
                    timezone: 'Europe/Paris'
                }
            };
        }

        const settings = formulaire.settings;
        const now = new Date();

        // 1. Vérifier la connexion requise
        if (settings.general?.connectionRequired && !req.user) {
            return res.status(401).json({
                success: false,
                message: 'Connexion requise pour accéder à ce formulaire'
            });
        }

        // 2. Vérifier si le formulaire est public
        if (!settings.general?.publicForm && formulaire.admin.toString() !== req.user?.id) {
            // Si le formulaire n'est pas public et l'utilisateur n'est pas l'admin
            return res.status(403).json({
                success: false,
                message: 'Ce formulaire n\'est pas public'
            });
        }

        // 3. Vérifier les dates de planification
        if (settings.scheduling?.startDate) {
            const startDate = new Date(settings.scheduling.startDate);
            if (now < startDate) {
                return res.status(403).json({
                    success: false,
                    message: `Ce formulaire sera disponible à partir du ${startDate.toLocaleDateString('fr-FR')}`
                });
            }
        }

        if (settings.scheduling?.endDate) {
            const endDate = new Date(settings.scheduling.endDate);
            if (now > endDate) {
                return res.status(403).json({
                    success: false,
                    message: `Ce formulaire n'est plus disponible depuis le ${endDate.toLocaleDateString('fr-FR')}`
                });
            }
        }

        // 4. Vérifier la limite de réponses
        if (settings.general?.limitResponses && settings.general?.maxResponses) {
            const currentResponses = formulaire.responseTotal || 0;
            if (currentResponses >= settings.general.maxResponses) {
                return res.status(403).json({
                    success: false,
                    message: `Ce formulaire a atteint sa limite de ${settings.general.maxResponses} réponses`
                });
            }
        }

        // Ajouter les paramètres à la requête pour utilisation ultérieure
        req.formulaire = formulaire;
        req.formulaireSettings = settings;

        next();

    } catch (error) {
        console.error('Erreur dans le middleware checkFormulaireSettings:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la vérification des paramètres'
        });
    }
}

/**
 * Middleware pour vérifier les permissions d'administration
 */
async function checkFormulaireAdmin(req, res, next) {
    try {
        const { formulaireId } = req.params;
        
        // Récupérer le formulaire
        const formulaire = await Formulaire.findById(formulaireId);
        
        if (!formulaire) {
            return res.status(404).json({
                success: false,
                message: 'Formulaire non trouvé'
            });
        }

        // Vérifier si l'utilisateur est l'admin du formulaire
        if (formulaire.admin.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé - vous n\'êtes pas l\'administrateur de ce formulaire'
            });
        }

        // Ajouter le formulaire à la requête
        req.formulaire = formulaire;

        next();

    } catch (error) {
        console.error('Erreur dans le middleware checkFormulaireAdmin:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la vérification des permissions'
        });
    }
}

/**
 * Middleware pour vérifier l'accès public au formulaire
 */
async function checkPublicAccess(req, res, next) {
    try {
        const { formulaireId } = req.params;
        
        // Récupérer le formulaire
        const formulaire = await Formulaire.findById(formulaireId);
        
        if (!formulaire) {
            return res.status(404).json({
                success: false,
                message: 'Formulaire non trouvé'
            });
        }

        // Vérifier si le formulaire est public ou si l'utilisateur est connecté
        const isPublic = formulaire.settings?.general?.publicForm || false;
        const isOwner = req.user && formulaire.admin.toString() === req.user.id;

        if (!isPublic && !isOwner) {
            return res.status(403).json({
                success: false,
                message: 'Ce formulaire n\'est pas accessible publiquement'
            });
        }

        // Ajouter le formulaire à la requête
        req.formulaire = formulaire;

        next();

    } catch (error) {
        console.error('Erreur dans le middleware checkPublicAccess:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la vérification de l\'accès public'
        });
    }
}

module.exports = {
    checkFormulaireSettings,
    checkFormulaireAdmin,
    checkPublicAccess
};
