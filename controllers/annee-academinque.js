
exports.store = async (req, res, next) => {

    try {

        let {
            titre,
            debut,
            fin
        } = req.body;

        const [dayD, monthD, yearD] = debut.split('-').map(Number);

        const [dayF, monthF, yearF] = fin.split('-').map(Number);

        const finD = new Date(yearF, monthF - 1, dayF);

        const debutD = new Date(yearD, monthD - 1, dayD);

        const anneeAcademinque = require('../models/annee-academinque')();

        anneeAcademinque.titre = titre;

        anneeAcademinque.debut = debutD;

        anneeAcademinque.fin = finD;

        const anneeAcademinqueSave = await anneeAcademinque.save();


        return res.status(201).json({
            message: 'Année academique crée avec succes',
            status: 'OK',
            data: anneeAcademinqueSave,
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
        const anneeAcademinques = await require('../models/annee-academinque').find(req.query).exec();
        res.json({
            message: 'Année academique  trouvée avec succes',
            status: 'OK',
            data: anneeAcademinques,
            statusCode: 200
        })
    } catch (error) {
        res.status(404).json({
            message: 'Année academique  non trouvée',
            status: 'OK',
            data: error,
            statusCode: 400
        })
    }
}

exports.one = async (req, res, next) => {
    try {
        const anneeAcademinque = await require('../models/annee-academinque').findById(req.params.id).exec();
        res.json({
            message: 'Année academique  trouvée avec succes',
            status: 'OK',
            data: anneeAcademinque,
            statusCode: 200
        })
    } catch (error) {
        res.status(404).json({
            message: 'Annee Academinque non trouvée',
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
            debut,
            fin
        } = req.body;

        const anneeAcademinque = await require('../models/annee-academinque').findById(req.params.id).exec();


        if (titre != undefined) {

            anneeAcademinque.titre = titre;

        }

        if (debut != undefined) {

            const [dayD, monthD, yearD] = debut.split('-').map(Number);

            const debutD = new Date(yearD, monthD - 1, dayD);

            anneeAcademinque.debut = debutD;

        }

        if (fin != undefined) {

            const [dayF, monthF, yearF] = fin.split('-').map(Number);

            const finD = new Date(yearF, monthF - 1, dayF);

            anneeAcademinque.fin = finD;

        }

        const anneeAcademinqueSave = await anneeAcademinque.save();


        res.json({
            message: 'modification de l\'année academique réussi',
            status: 'OK',
            data: anneeAcademinqueSave,
            statusCode: 200
        });

    } catch (error) {
        res.status(404).json({
            message: 'Annee Academinque non modifie',
            status: 'NOT OK',
            data: error,
            statusCode: 400
        })
    }


}

exports.delete = (req, res, next) => require('../models/annee-academinque').findByIdAndDelete(req.params.id).then(result => {
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