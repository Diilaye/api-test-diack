

exports.store = async (req, res, next) => {

    try {

        let {
            type,
            nom,
            description,
            idForm
        } = req.body;

        console.log("req.body");
        console.log(req.body);

        const champ = require('../models/champ')();

        const idt= makeid(20);


        champ.type = type;

        if(champ.type == 'singleChoice' || champ.type == 'multiChoice') {
            champ.listeOptions = [
                { "option" : "option 1" ,"delete" : "false", "id" : idt }
            ];
            
            champ.listeReponses = [
                { "option" : "option 1" ,"delete" : "false", "id" : idt }
            ];
        }else if(champ.type == 'yesno') {
            champ.listeOptions = [
                { "option" : "OUI" ,"delete" : "false", "id" : idt  },
                { "option" : "NON" ,"delete" : "false", "id" : makeid(20) }
            ];

            champ.listeReponses = [
                { "option" : "OUI" , "id" : idt}
            ];
        }



        champ.nom = nom;

        champ.description = description;

        champ.formulaire =idForm;

        const champSave = await champ.save();

        console.log("champSave");
        console.log(champSave);

        return res.status(201).json({
            message: 'champ crée avec succes',
            status: 'OK',
            data: champSave,
            statusCode: 201
        })



    } catch (error) {
        res.status(404).json({
            message: 'Erreur creation',
            status: 'OK',
            data: error,
            statusCode: 400
        })
    }

}



exports.all = async (req, res, next) => {

    try {
        const champ = await require('../models/champ').find(req.query).exec();
        res.json({
            message: 'champ trouvée avec succes',
            status: 'OK',
            data: champ,
            statusCode: 200
        })
    } catch (error) {
        res.status(404).json({
            message: 'champ  non trouvée',
            status: 'OK',
            data: error,
            statusCode: 400
        })
    }
}

exports.allByFormulaire = async (req, res, next) => {

    try {
        
        const champ = await require('../models/champ').find({
            formulaire : req.params.idForm
        }).exec();
        res.json({
            message: 'champ trouvée avec succes',
            status: 'OK',
            data: champ,
            statusCode: 200
        })
    } catch (error) {
        res.status(404).json({
            message: 'champ  non trouvée',
            status: 'OK',
            data: error,
            statusCode: 400
        })
    }
}

exports.one = async (req, res, next) => {
    try {
        const champ = await require('../models/champ').findById(req.params.id).exec();
        res.json({
            message: 'champ trouvée avec succes',
            status: 'OK',
            data: champ,
            statusCode: 200
        })
    } catch (error) {
        res.status(404).json({
            message: 'champ non trouvée',
            status: 'OK',
            data: error,
            statusCode: 400
        })
    }
}

exports.update = async (req, res, next) => {

    let {
        type,
        nom,
        description,
        listeReponses,
        isObligatoire,
        haveResponse,
        notes,
        options,
        valueOption
    } = req.body;

    const champ = await require('../models/champ').findById(req.params.id).exec();

 
    

    if (type != undefined) {

        champ.type = type;

        champ.listeOptions = [];

    }


    if (isObligatoire != undefined) {

        champ.isObligatoire = isObligatoire;

    }

    if (haveResponse != undefined) {

        champ.haveResponse = haveResponse;

    }

    if (notes != undefined) {

        champ.notes = notes;

    }

    if (nom != undefined) {

        champ.nom = nom;

    }

    if (description != undefined) {

        champ.description = description;

    }

    if (listeReponses != undefined) {

        let vl = 0;

        for (let index = 0; index < champ.listeReponses.length; index++) {
            var element = champ.listeReponses[index];

            if(listeReponses['id'] == element['id']) {
                vl =1;
            }
            
        }

        if (vl==0) {
         champ.listeReponses.push({ "option" : listeReponses["option"] , "id" : listeReponses['id']});
            
        } else {
            const tab = [];
            for (let index = 0; index < champ.listeReponses.length; index++) {
                var el = champ.listeReponses[index];

                if(listeReponses['id'] != el['id']) {
                    tab.push(el);

                }
                
            }
            champ.listeReponses = tab;
        }

        


    }



    if (options != undefined) {

        champ.listeOptions.push({ "option" : options , "id" : makeid(20) , delete : "false" }) ;

    }

    if (valueOption != undefined) {

        const tab = [];

        console.log("valueOption");
        console.log(valueOption['delete']);


        for (let index = 0; index < champ.listeOptions.length; index++) {
            var element = champ.listeOptions[index];    
           
            

            if(element['id'] == valueOption['id']) {
                element['option'] = valueOption['option']
                 if(valueOption['delete'] != 'true') {
                    tab.push(element);
                }
            } else {
                tab.push(element);
            }
            
        }

      

        champ.listeOptions = tab ;

    }

    const champSave = await champ.save();

   


    res.json({
        message: 'modification champ réussi',
        status: 'OK',
        data: champSave,
        statusCode: 200
    });

    try {
        

    } catch (error) {
        res.status(404).json({
            message: 'Champ non modifie',
            status: 'NOT OK',
            data: error,
            statusCode: 400
        })
    }


}

exports.reponseMultiChoice = async (req, res, next) => {
    try {
        const { option } = req.body;

        // Validation des données d'entrée
        if (!option || !option.id) {
            return res.status(400).json({
                message: 'Option invalide - ID requis',
                status: 'ERROR',
                data: null,
                statusCode: 400
            });
        }

        const champ = await require('../models/champ').findById(req.params.id).exec();

        if (!champ) {
            return res.status(404).json({
                message: 'Champ non trouvé',
                status: 'ERROR',
                data: null,
                statusCode: 404
            });
        }

        // Initialiser listeOptions si elle n'existe pas
        if (!champ.listeOptions) {
            champ.listeOptions = [];
        }

        // Vérifier si l'option existe déjà dans les options
        const existingOptionIndex = champ.listeOptions.findIndex(opt => {
            return opt.id === option.id;
        });

        if (option.delete === 'true') {
            // Supprimer l'option
            if (existingOptionIndex !== -1) {
                champ.listeOptions.splice(existingOptionIndex, 1);
            }
        } else {
            if (existingOptionIndex === -1) {
                // Ajouter la nouvelle option
                champ.listeOptions.push({
                    option: option.option,
                    id: option.id,
                    delete: 'false'
                });
            } else {
                // Mettre à jour l'option existante
                champ.listeOptions[existingOptionIndex].option = option.option;
                champ.listeOptions[existingOptionIndex].delete = 'false';
            }
        }

        const champSave = await champ.save();

        res.json({
            message: 'Options champ mise à jour avec succès',
            status: 'OK',
            data: champSave,
            statusCode: 200
        });

    } catch (error) {
        console.error('Erreur lors de la mise à jour des options:', error);
        res.status(500).json({
            message: 'Erreur interne du serveur',
            status: 'ERROR',
            data: error.message || error,
            statusCode: 500
        });
    }
}

exports.reponseTexield = async (req, res, next) => {    
   try {
    let {
        listeReponses
    } = req.body;

    const champ = await require('../models/champ').findById(req.params.id).exec();

    champ.listeReponses = listeReponses;

    const champSave = await champ.save();

    res.json({
        message: 'reponse champ réussi',
        status: 'OK',
        data: champSave,
        statusCode: 200
    });
   } catch (error) {
    res.status(404).json({
        message: 'Champ non modifie',
        status: 'NOT OK',
        data: error,
        statusCode: 400
    })
   }

}

exports.delete = (req, res, next) => require('../models/champ').findByIdAndDelete(req.params.id).then(result => {
    res.status(200).json({
        message: 'supréssion réussi',
        status: 'OK',
        data: null,
        statusCode: 200
    });
}).catch(err => res.status(404).json({
    message: 'erreur supréssion ',
    statusCode: 404,
    data: err,
    status: 'NOT OK'
}));

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
