
exports.add = async (req, res, next) => {
    let {
        titre,
        color,
    } = req.body;

    const folder =  require('../models/folder-model')({
        titre,
        color,
        userCreate: req.user.id_user

    });

        
        const v = await folder.save();

    const fD = await require('../models/folder-model').findById(v.id).populate('userCreate')

    try {
        res.status(201).json({
            message: 'folder create',
            statusCode: 200,
            data: fD
        });
    } catch (error) {
        res.status(400).json({
            message: error.message,
            statusCode: 400
        })
    }
}

exports.all = async (req, res, next) => {    
    try {
        const folder = await require('../models/folder-model').find(req.query).populate('userCreate').exec();
        res.status(200).json({
            message: 'folder found',
            statusCode: 200,
            data: folder
        });
    } catch (error) {
        res.status(404).json({
            message: error.message,
            statusCode: 404
        })
    }
}
exports.allByUser = async (req, res, next) => {    
    try {
        const folder = await require('../models/folder-model').find({
            userCreate : req.user.id_user
        }).populate('userCreate').exec();
        res.status(200).json({
            message: 'folder found',
            statusCode: 200,
            data: folder
        });
    } catch (error) {
        res.status(404).json({
            message: error.message,
            statusCode: 404
        })
    }
}

exports.one = async (req, res, next) => {
    try {
        const folder = await require('../models/folder-model').findById(req.params.id).populate('userCreate').exec();
        res.status(200).json({
            message: 'folder found',
            statusCode: 200,
            data: folder
        });
    } catch (error) {
        res.status(404).json({
            message: error.message,
            statusCode: 404
        })
    }
}   

exports.update = async (req, res, next) => {    
    let {
        titre,
        form,
        color
    } = req.body;

    try {
        const folder = await require('../models/folder-model').findById(req.params.id).exec();
        folder.titre = titre;
        folder.form = form;
        folder.color = color;
        await folder.save();
        res.status(200).json({
            message: 'folder found',
            statusCode: 200,
            data: folder
        });
    } catch (error) {
        res.status(404).json({
            message: error.message,
            statusCode: 404
        })
    }
}

exports.delete = async (req, res, next) => {
    try {
        await require('../models/folder-model').deleteOne({ _id: req.params.id }).exec();
        res.json({
            message: 'folder deleted',
            statusCode: 200
        });
    } catch (error) {
        res.status(404).json({
            message: error.message,
            statusCode: 404
        })
    }
}