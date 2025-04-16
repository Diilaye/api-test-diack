

const responseModel = require('../models/response-formulaire');

const champsModel = require('../models/champ');

const responseSendeurFormulaire = require('../models/response-sondeur-model');

const mongoose = require('mongoose');

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