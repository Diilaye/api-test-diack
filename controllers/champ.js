const { Info } = require('luxon');

exports.store = async (req, res, next) => {

    try {

        let {
            type,
            nom,
            description,
            listeReponses,
            idForm
        } = req.body;

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
            var element = Object.fromEntries(element.entries())

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
                var el = Object.fromEntries(el.entries())

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
            var element = Object.fromEntries(element.entries()) ;
           
            

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

    let {
        option
    } = req.body;

    const champ = await require('../models/champ').findById(req.params.id).exec();


    let vl = 0;

    for (let index = 0; index < champ.listeReponses.length; index++) {
        var element = champ.listeReponses[index];
        var element = Object.fromEntries(element.entries())

        if(option['id'] == element['id']) {
            vl =1;
        }
        
    }

    if (vl==0) {
     champ.listeReponses.push({ "option" : option["option"] , "id" : option['id'] , delete : 'false'});
        
    } else {
        const tab = [];
        for (let index = 0; index < champ.listeReponses.length; index++) {
            var el = champ.listeReponses[index];
            var el = Object.fromEntries(el.entries())

            if(option['id'] != el['id']) {
                tab.push(el);

            }
            
        }
        champ.listeReponses = tab;
    }

    

    const champSave = await champ.save();

    res.json({
        message: 'reponse champ réussi',
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
