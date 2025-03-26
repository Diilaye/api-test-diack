

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

    
    //        if(champs['listeReponses'].length == 0) {
    //         champs['listeReponses'].push({
    //             "id" : makeid(20),
    //             "sondeur" : req.user.id_user,
    //             "reponse" :listRep
    //         });
    
    //        }else {
            
    //         const newReponseListe = [];
    
    //         for await (const element of champs['listeReponses']) {
    //             const obj = Object.fromEntries(element);
    
                
                
    //             if(champs['type'] == 'checkBox') {
                    
    //                 if(obj.sondeur == req.user.id_user && obj.id==idReponse) {
    //                     newReponseListe.push({
    //                         "id" : obj.id,
    //                         "sondeur" : req.user.id_user,
    //                         "reponse" :listRep
    //                     });
    
    //                 }else {
    //                     newReponseListe.push(element);
    //                 }
    
    //             } else if(champs['type'] == 'dropdowns') {
    // console.log("dropdowns");
                    
    //             }else {
    // console.log("ekse");
    
    //             }
    
    //             console.log(obj.id );
    //             console.log(obj.sondeur );
    //             console.log(obj.reponse );
    //         }
    
    //         champs['listeReponses'] = newReponseListe;
    
    //        }
    
        //    const c = await  champs.save();
    
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