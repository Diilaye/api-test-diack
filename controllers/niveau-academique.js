
exports.store = async (req, res, next) => {

    try {

        let {
            titre,
            description
        } = req.body;

        const niveauAcademique = require('../models/niveau-academique')();

        niveauAcademique.titre = titre;

        niveauAcademique.description = description;

        const niveauAcademiqueSave = await niveauAcademique.save();


        return res.status(201).json({
            message: 'niveau-academique crée avec succes',
            status: 'OK',
            data: niveauAcademiqueSave,
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
        const niveauAcademiques = await require('../models/niveau-academique').find(req.query).exec();
        res.json({
            message: 'niveau-academique trouvée avec succes',
            status: 'OK',
            data: niveauAcademiques,
            statusCode: 200
        })
    } catch (error) {
        res.status(404).json({
            message: 'niveau-academique  non trouvée',
            status: 'OK',
            data: error,
            statusCode: 400
        })
    }
}

exports.one = async (req, res, next) => {
    try {
        const niveauAcademique = await require('../models/niveau-academique').findById(req.params.id).exec();
        res.json({
            message: 'niveau-academique trouvée avec succes',
            status: 'OK',
            data: niveauAcademique,
            statusCode: 200
        })
    } catch (error) {
        res.status(404).json({
            message: 'niveau-academique non trouvée',
            status: 'OK',
            data: error,
            statusCode: 400
        })
    }
}

exports.update = async (req, res, next) => {

    try {
        let {
            titre,
            description
        } = req.body;

        const niveauAcademique = await require('../models/niveau-academique').findById(req.params.id).exec();


        if (titre != undefined) {

            niveauAcademique.titre = titre;

        }

        if (description != undefined) {

            niveauAcademique.description = description;

        }

        const niveauAcademiqueSave = await niveauAcademique.save();


        res.json({
            message: 'modification niveau-academique réussi',
            status: 'OK',
            data: niveauAcademiqueSave,
            statusCode: 200
        });

    } catch (error) {
        res.status(404).json({
            message: 'niveau-academique non modifie',
            status: 'NOT OK',
            data: error,
            statusCode: 400
        })
    }


}

exports.delete = (req, res, next) => require('../models/niveau-academique').findByIdAndDelete(req.params.id).then(result => {
    res.json({
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