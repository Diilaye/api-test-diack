const router = require('express').Router();
const formulaireReponseController = require('../controllers/response-fomulaire-controlleur');
const auth = require('../midleweares/auth');

// Route pour soumettre une réponse à un formulaire
router.post('/submit', formulaireReponseController.addResponseSondee);

// Route pour récupérer toutes les réponses d'un formulaire spécifique
router.get('/formulaire/:formulaireId', formulaireReponseController.getAllReponseByFormulaire);

// Route pour obtenir les statistiques d'un formulaire
router.get('/stats/formulaire/:formulaireId', async (req, res) => {
    try {
        // Cette fonction n'existe peut-être pas encore, vous devrez l'implémenter
        // Pour l'instant, renvoyons une réponse basique
        res.status(200).json({
            status: 200,
            message: 'Statistiques récupérées avec succès',
            data: {
                totalReponses: 0,
                // Ajoutez d'autres statistiques au besoin
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({
            status: 500,
            message: 'Erreur lors de la récupération des statistiques',
            error: error.message
        });
    }
});

// Route pour récupérer une réponse spécifique
router.get('/:reponseId', async (req, res) => {
    // Cette fonction n'existe peut-être pas encore, vous devrez l'implémenter
    res.status(501).json({
        status: 501,
        message: 'Fonctionnalité non implémentée',
    });
});

// Route pour supprimer une réponse
router.delete('/:reponseId', auth.checkManyRole(['sonde', 'agent']), formulaireReponseController.deleteResponseSondeur);

module.exports = router;
