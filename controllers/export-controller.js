const { Parser } = require('json2csv');
const formulaireModel = require('../models/formulaire');
const champsModel = require('../models/champ');
const mongoose = require('mongoose');

// Export des réponses d'un formulaire en CSV
exports.exportFormResponsesToCSV = async (req, res) => {
    try {
        const { formulaireId } = req.params;

        console.log('DEBUG: Export des réponses pour le formulaire:', formulaireId);

        // Récupérer le formulaire avec ses champs et réponses
        const formulaire = await formulaireModel.findById(formulaireId)
            .populate({
                path: 'champs',
                model: 'champs-form'
            })
            .lean();

        if (!formulaire) {
            console.log('DEBUG: Formulaire non trouvé');
            return res.status(404).json({
                message: 'Formulaire non trouvé',
                status: 'ERROR',
                statusCode: 404
            });
        }

        console.log('DEBUG: Formulaire trouvé:', formulaire.titre);
        console.log('DEBUG: Nombre de champs:', formulaire.champs?.length || 0);
        console.log('DEBUG: Nombre de réponses:', formulaire.responseSondee?.length || 0);

        // Si les champs ne sont pas populés, les récupérer manuellement
        let champs = formulaire.champs;
        if (!champs || champs.length === 0) {
            console.log('DEBUG: Récupération manuelle des champs');
            champs = await champsModel.find({ formulaire: formulaireId }).lean();
            console.log('DEBUG: Champs récupérés manuellement:', champs.length);
        }

        // Préparer les données pour le CSV
        const csvData = [];

        // Créer un mapping des champs pour les headers
        const champsMap = {};
        if (champs && champs.length > 0) {
            champs.forEach(champ => {
                champsMap[champ._id.toString()] = champ.nom || champ.titre || `Champ_${champ._id}`;
            });
        }

        console.log('DEBUG: Mapping des champs:', champsMap);

        // Récupérer les options des champs pour mapper les valeurs
        const optionsMap = {};
        if (champs && champs.length > 0) {
            champs.forEach(champ => {
                if (champ.listeOptions && Array.isArray(champ.listeOptions)) {
                    optionsMap[champ._id.toString()] = {};
                    champ.listeOptions.forEach(option => {
                        optionsMap[champ._id.toString()][option.id] = option.option;
                    });
                }
            });
        }

        console.log('DEBUG: Mapping des options:', optionsMap);

        // Traiter chaque réponse de sonde
        if (formulaire.responseSondee && Array.isArray(formulaire.responseSondee)) {
            formulaire.responseSondee.forEach((sondeResponse, index) => {
                console.log(`DEBUG: Traitement réponse ${index + 1}`, sondeResponse.sondeId);
                
                const row = {
                    'Utilisateur': sondeResponse.sondeId || 'Anonyme',
                    'Email': 'N/A', // Pas d'email dans cette structure
                    'Date de réponse': sondeResponse.dateSubmission ? 
                        new Date(sondeResponse.dateSubmission).toLocaleDateString('fr-FR') : 'N/A'
                };

                // Initialiser toutes les colonnes de questions avec des valeurs vides
                Object.values(champsMap).forEach(champNom => {
                    row[champNom] = '';
                });

                // Remplir les réponses
                if (sondeResponse.reponses && Array.isArray(sondeResponse.reponses)) {
                    sondeResponse.reponses.forEach(reponse => {
                        const champNom = champsMap[reponse.champId];
                        if (champNom) {
                            // Essayer de mapper la valeur avec les options
                            let valeurFinale = reponse.valeur || '';
                            
                            // Si c'est un ID d'option, chercher le texte correspondant
                            if (optionsMap[reponse.champId] && optionsMap[reponse.champId][reponse.valeur]) {
                                valeurFinale = optionsMap[reponse.champId][reponse.valeur];
                            }
                            
                            row[champNom] = valeurFinale;
                            console.log(`DEBUG: ${champNom} = ${valeurFinale}`);
                        }
                    });
                }

                csvData.push(row);
            });
        }

        // Si aucune donnée, créer un exemple avec les headers
        if (csvData.length === 0) {
            console.log('DEBUG: Aucune réponse, création d\'une ligne vide');
            const emptyRow = {
                'Utilisateur': '',
                'Email': '',
                'Date de réponse': '',
                ...Object.values(champsMap).reduce((acc, champNom) => {
                    acc[champNom] = '';
                    return acc;
                }, {})
            };
            csvData.push(emptyRow);
        }

        // Définir les champs pour le CSV
        const fields = [
            'Utilisateur',
            'Email', 
            'Date de réponse',
            ...Object.values(champsMap)
        ];

        console.log('DEBUG: Fields pour CSV:', fields);
        console.log('DEBUG: Données CSV préparées:', csvData.length, 'lignes');

        // Créer le CSV
        const json2csvParser = new Parser({ fields, delimiter: ';' });
        const csv = json2csvParser.parse(csvData);

        // Définir les headers pour le téléchargement
        const filename = `reponses_${formulaire.titre.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Cache-Control', 'no-cache');
        
        // Ajouter BOM pour Excel UTF-8
        res.write('\uFEFF');
        res.end(csv);

        console.log('DEBUG: CSV envoyé avec succès, nom de fichier:', filename);

    } catch (error) {
        console.error('Erreur lors de l\'export CSV:', error);
        return res.status(500).json({
            message: 'Erreur lors de l\'export CSV',
            status: 'ERROR',
            error: error.message,
            statusCode: 500
        });
    }
};

// Export de tous les formulaires en CSV
exports.exportAllFormulairesToCSV = async (req, res) => {
    try {
        // Récupérer tous les formulaires avec leurs informations de base
        const formulaires = await formulaireModel.find()
            .populate('admin', 'nom prenom email')
            .populate('folderForm', 'nom')
            .lean();

        // Préparer les données pour le CSV
        const csvData = formulaires.map(formulaire => ({
            'ID': formulaire._id,
            'Titre': formulaire.titre || 'N/A',
            'Description': formulaire.description || 'N/A',
            'Date de création': formulaire.date ? new Date(formulaire.date).toLocaleDateString('fr-FR') : 'N/A',
            'Administrateur': formulaire.admin ? 
                `${formulaire.admin.prenom || ''} ${formulaire.admin.nom || ''}`.trim() : 'N/A',
            'Email admin': formulaire.admin?.email || 'N/A',
            'Dossier': formulaire.folderForm?.nom || 'N/A',
            'Nombre de réponses': formulaire.responseTotal || 0,
            'Formulaire public': formulaire.settings?.general?.publicForm ? 'Oui' : 'Non',
            'Connexion requise': formulaire.settings?.general?.connectionRequired ? 'Oui' : 'Non',
            'Limite de réponses': formulaire.settings?.general?.limitResponses ? 'Oui' : 'Non',
            'Max réponses': formulaire.settings?.general?.maxResponses || 'N/A'
        }));

        // Définir les champs pour le CSV
        const fields = [
            'ID', 'Titre', 'Description', 'Date de création',
            'Administrateur', 'Email admin', 'Dossier', 
            'Nombre de réponses', 'Formulaire public', 
            'Connexion requise', 'Limite de réponses', 'Max réponses'
        ];

        // Créer le CSV
        const json2csvParser = new Parser({ fields, delimiter: ';' });
        const csv = json2csvParser.parse(csvData);

        // Définir les headers pour le téléchargement
        const filename = `formulaires_${new Date().toISOString().split('T')[0]}.csv`;
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Cache-Control', 'no-cache');
        
        // Ajouter BOM pour Excel UTF-8
        res.write('\uFEFF');
        res.end(csv);

    } catch (error) {
        console.error('Erreur lors de l\'export CSV des formulaires:', error);
        return res.status(500).json({
            message: 'Erreur lors de l\'export CSV des formulaires',
            status: 'ERROR',
            error: error.message,
            statusCode: 500
        });
    }
};

// Export des utilisateurs en CSV
exports.exportUsersToCSV = async (req, res) => {
    try {
        const userModel = require('../models/user');
        
        // Récupérer tous les utilisateurs
        const users = await userModel.find().lean();

        // Préparer les données pour le CSV
        const csvData = users.map(user => ({
            'ID': user._id,
            'Nom': user.nom || 'N/A',
            'Prénom': user.prenom || 'N/A',
            'Email': user.email || 'N/A',
            'Téléphone': user.telephone || 'N/A',
            'Adresse': user.adresse || 'N/A',
            'Date de création': user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A',
            'Dernière mise à jour': user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('fr-FR') : 'N/A'
        }));

        // Définir les champs pour le CSV
        const fields = [
            'ID', 'Nom', 'Prénom', 'Email', 'Téléphone', 
            'Adresse', 'Date de création', 'Dernière mise à jour'
        ];

        // Créer le CSV
        const json2csvParser = new Parser({ fields, delimiter: ';' });
        const csv = json2csvParser.parse(csvData);

        // Définir les headers pour le téléchargement
        const filename = `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`;
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Cache-Control', 'no-cache');
        
        // Ajouter BOM pour Excel UTF-8
        res.write('\uFEFF');
        res.end(csv);

    } catch (error) {
        console.error('Erreur lors de l\'export CSV des utilisateurs:', error);
        return res.status(500).json({
            message: 'Erreur lors de l\'export CSV des utilisateurs',
            status: 'ERROR',
            error: error.message,
            statusCode: 500
        });
    }
};