
exports.store = async (req, res, next) => {

    try {

        let {
            titre,
            description
        } = req.body;

        const matiere = require('../models/matiere')();

        matiere.titre = titre;

        matiere.description = description;

        const matiereSave = await matiere.save();


        return res.status(201).json({
            message: 'matiere crée avec succes',
            status: 'OK',
            data: matiereSave,
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
        const matiere = await require('../models/matiere').find(req.query).exec();
        res.json({
            message: 'matiere trouvée avec succes',
            status: 'OK',
            data: matiere,
            statusCode: 200
        })
    } catch (error) {
        res.status(404).json({
            message: 'matiere  non trouvée',
            status: 'OK',
            data: error,
            statusCode: 400
        })
    }
}

exports.one = async (req, res, next) => {
    try {
        const matiere = await require('../models/matiere').findById(req.params.id).exec();
        res.json({
            message: 'matiere trouvée avec succes',
            status: 'OK',
            data: matiere,
            statusCode: 200
        })
    } catch (error) {
        res.status(404).json({
            message: 'matiere non trouvée',
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

        const matiere = await require('../models/matiere').findById(req.params.id).exec();


        if (titre != undefined) {

            matiere.titre = titre;

        }

        if (description != undefined) {

            matiere.description = description;

        }

        const matiereSave = await matiere.save();


        res.json({
            message: 'modification matiere réussi',
            status: 'OK',
            data: matiereSave,
            statusCode: 200
        });

    } catch (error) {
        res.status(404).json({
            message: 'matiere non modifie',
            status: 'NOT OK',
            data: error,
            statusCode: 400
        })
    }


}

exports.delete = (req, res, next) => require('../models/matiere').findByIdAndDelete(req.params.id).then(result => {
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