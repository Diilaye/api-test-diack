

const responseModel = require('../models/response-formulaire');

const champsModel = require('../models/champ');

const responseSendeurFormulaire = require('../models/response-sondeur-model');

const mongoose = require('mongoose');
const { response } = require('express');

exports.addReponseForm = async (req,res) => {

   
    
    try {
        
        let {
            idChamp,
            idOption,
            option
        } = req.body ;
    
    
        const champs = await champsModel.findById(idChamp);
        
    
        if(champs != null) {


            const responseSopndeurForm = responseSendeurFormulaire();

            responseSopndeurForm.champ = idChamp;
            responseSopndeurForm.responseID = makeid(20);
            responseSopndeurForm.responseEtat = option;
            responseSopndeurForm.responseEtatID = idOption;
            responseSopndeurForm.sondeur = req.user.id_user;

            const reSonFrom = await responseSopndeurForm.save();

    
            return res.status(201).json({
                message: 'responses crée avec succes',
                status: 'OK',
                data: reSonFrom,
                statusCode: 201
            })
    
        }

    } catch (error) {
      return  res.status(404).json({
            message: 'Erreur creation',
            status: 'OK',
            data: error,
            statusCode: 400
        })
    }

}

exports.deleteResponseSondeur = async (req,res) => {

    

        try {
            let {idChamps, responseID} = req.query;

            const idChampsObj = new mongoose.Types.ObjectId(idChamps);
            const userIdObj = new mongoose.Types.ObjectId(req.user.id_user);
        
            const responseSendeurForm = await responseSendeurFormulaire.findOneAndDelete({
                champ: idChampsObj,
                sondeur: userIdObj,
                responseID
            });
        
            return res.status(200).json({
                message: 'responses delete avec succes',
                status: 'OK',
                data: responseSendeurForm,
                statusCode: 200
            })
            
        } catch (error) {
            
            return  res.status(404).json({
                message: 'Erreur creation',
                status: 'OK',
                data: error,
                statusCode: 400
            });
        }

}

exports.getResponseSondeur = async (req,res) => {


    let {idChamps} = req.query;

    try {

        const idChampsObj = new mongoose.Types.ObjectId(idChamps);
        const userIdObj = new mongoose.Types.ObjectId(req.user.id_user);
    
        const responseSendeurForm = await responseSendeurFormulaire.find({
            champ: idChampsObj,
            sondeur: userIdObj,
        });

        return res.status(200).json({
            message: 'responses crée avec succes',
            status: 'OK',
            data: responseSendeurForm,
            statusCode: 200
        })
        
    } catch (error) {
        return  res.status(404).json({
            message: 'Erreur creation',
            status: 'OK',
            data: error,
            statusCode: 400
        });
    }

}

exports.getAllReponseByFormulaire = async (req,res) => {
    let {idformulaire} = req.params;

    try {

        const champ = await require('../models/champ').find({
            formulaire : idformulaire
        }).exec();
        res.json({
            message: 'champ trouvée avec succes',
            status: 'OK',
            data: champ,
            statusCode: 200
        })

        // const idChampsObj = new mongoose.Types.ObjectId(idChamps);
        // const userIdObj = new mongoose.Types.ObjectId(req.user.id_user);
    
        // const responseSendeurForm = await responseSendeurFormulaire.find({
        //     champ: idChampsObj,
        //     sondeur: userIdObj,
        // });

        // return res.status(200).json({
        //     message: 'responses crée avec succes',
        //     status: 'OK',
        //     data: responseSendeurForm,
        //     statusCode: 200
        // })
        
    } catch (error) {
        return  res.status(404).json({
            message: 'Erreur creation',
            status: 'OK',
            data: error,
            statusCode: 400
        });
    }

}

exports.addResponseByFormulaire = async (req,res) => {
    let {idformulaire} = req.params;
    const idSonde = makeid(20);



    try {

        const formulaire = await require('../models/formulaire').findById(idformulaire).exec();

        if(!formulaire) {
            return res.status(404).json({
                message: 'Formulaire introuvable',
                status: 'OK',
                data: null,
                statusCode: 404
            })
        }

        
    

        const champ = await require('../models/champ').find({
            formulaire : idformulaire
        }).exec();
        res.json({
            message: 'champ trouvée avec succes',
            status: 'OK',
            data: champ,
            statusCode: 200
        })

        
    } catch (error) {
        return  res.status(404).json({
            message: 'Erreur creation',
            status: 'OK',
            data: error,
            statusCode: 400
        });
    }

}

exports.addResponseSondee = async (req, res) => {
    try {
        const { id: formulaireId } = req.params;
        const { sondeId, responses } = req.body;

        // Validation des paramètres requis
        if (!formulaireId || !responses) {
            return res.status(400).json({
                message: 'Paramètres manquants: formulaireId et responses sont requis',
                status: 'ERROR',
                data: null,
                statusCode: 400
            });
        }

        // Vérifier que le formulaire existe
        const formulaire = await require('../models/formulaire').findById(formulaireId).exec();
        if (!formulaire) {
            return res.status(404).json({
                message: 'Formulaire introuvable',
                status: 'ERROR',
                data: null,
                statusCode: 404
            });
        }

        // Récupérer tous les champs du formulaire
        const champs = await require('../models/champ').find({
            formulaire: formulaireId
        }).populate('listeOptions').exec();

        if (!champs || champs.length === 0) {
            return res.status(404).json({
                message: 'Aucun champ trouvé pour ce formulaire',
                status: 'ERROR',
                data: null,
                statusCode: 404
            });
        }

        // Générer un ID unique pour la sonde si non fourni
        const finalSondeId = sondeId || makeid(20);

        // Traiter les réponses
        const reponsesFormattees = [];

        // Parcourir tous les champs du formulaire
        for (const champ of champs) {
            const champId = champ._id.toString();
            let reponseValue = null;
            let reponseType = champ.type;

            // Chercher la réponse correspondante dans les données envoyées
            for (const [typeChamp, reponsesParType] of Object.entries(responses)) {
                if (reponsesParType && typeof reponsesParType === 'object') {
                    if (reponsesParType[champId] !== undefined) {
                        reponseValue = reponsesParType[champId];
                        reponseType = typeChamp;
                        break;
                    }
                }
            }

            // Valider les champs obligatoires
            if (champ.isObligatoire === '1' && (reponseValue === null || reponseValue === '' || reponseValue === undefined)) {
                return res.status(400).json({
                    message: `Le champ "${champ.nom}" est obligatoire`,
                    status: 'ERROR',
                    data: {
                        champManquant: {
                            id: champId,
                            nom: champ.nom,
                            type: champ.type
                        }
                    },
                    statusCode: 400
                });
            }

            // Valider les réponses à choix multiples/unique
            if ((champ.type === 'choix_unique' || champ.type === 'choix_multiple') && reponseValue) {
                const optionsValides = champ.listeOptions ? champ.listeOptions.map(opt => opt.option) : [];
                
                if (champ.type === 'choix_multiple' && Array.isArray(reponseValue)) {
                    // Vérifier que toutes les options sélectionnées sont valides
                    const optionsInvalides = reponseValue.filter(option => !optionsValides.includes(option));
                    if (optionsInvalides.length > 0) {
                        return res.status(400).json({
                            message: `Options invalides pour le champ "${champ.nom}": ${optionsInvalides.join(', ')}`,
                            status: 'ERROR',
                            data: { optionsValides },
                            statusCode: 400
                        });
                    }
                } else if (champ.type === 'choix_unique' && !optionsValides.includes(reponseValue)) {
                    return res.status(400).json({
                        message: `Option invalide pour le champ "${champ.nom}": ${reponseValue}`,
                        status: 'ERROR',
                        data: { optionsValides },
                        statusCode: 400
                    });
                }
            }

            // Ajouter la réponse formatée
            if (reponseValue !== null && reponseValue !== undefined) {
                reponsesFormattees.push({
                    champId: champId,
                    champNom: champ.nom,
                    champType: champ.type,
                    valeur: reponseValue,
                    typeReponse: reponseType,
                    dateReponse: new Date()
                });
            }
        }

        // Créer l'objet de réponse sonde
        const nouvelleSondeReponse = {
            sondeId: finalSondeId,
            dateSubmission: new Date(),
            reponses: reponsesFormattees,
            statut: 'complete',
            metadata: {
                nombreReponses: reponsesFormattees.length,
                nombreChampsTotal: champs.length,
                tauxCompletion: Math.round((reponsesFormattees.length / champs.length) * 100)
            }
        };

        // Ajouter la réponse au formulaire
        formulaire.responseSondee.push(nouvelleSondeReponse);
        formulaire.responseTotal = (formulaire.responseTotal || 0) + 1;

        // Sauvegarder le formulaire mis à jour
        const formulaireMisAJour = await formulaire.save();

        // Retourner la réponse de succès
        return res.status(201).json({
            message: 'Réponse de sonde enregistrée avec succès',
            status: 'SUCCESS',
            data: {
                sondeId: finalSondeId,
                formulaireId: formulaireId,
                nombreReponses: reponsesFormattees.length,
                tauxCompletion: nouvelleSondeReponse.metadata.tauxCompletion,
                dateSubmission: nouvelleSondeReponse.dateSubmission,
                reponses: reponsesFormattees,
                formulaire: {
                    id: formulaireMisAJour._id,
                    titre: formulaireMisAJour.titre,
                    responseTotal: formulaireMisAJour.responseTotal
                }
            },
            statusCode: 201
        });

    } catch (error) {
        console.error('Erreur lors de l\'ajout de la réponse sonde:', error);
        return res.status(500).json({
            message: 'Erreur interne du serveur',
            status: 'ERROR',
            data: {
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            statusCode: 500
        });
    }
};






function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}