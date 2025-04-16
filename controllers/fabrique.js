
const Fabrique = require('../models/fabrique');

class FabriqueController {

    async create(req, res) {   
        try {
            const { nom, contact, region, pays } = req.body;
            const fabrique = new Fabrique({ nom, contact, region, pays });
            await fabrique.save();
            res.status(201).json({ message: 'Création réussie', status: 'OK', data: fabrique });
        } catch (error) {
            res.status(400).json({ message: 'Erreur de création', status: 'NOT OK', data: error });
        }
    }
    async findAll(req, res) {
        try {
            const fabriques = await Fabrique.find(req.query).exec();
            res.status(200).json({ message: 'Fabriques trouvées', status: 'OK', data: fabriques });
        } catch (error) {
            res.status(400).json({ message: 'Erreur de récupération', status: 'NOT OK', data: error });
        }
    }
    async findOne(req, res) {
        try {
            const fabrique = await Fabrique.findById(req.params.id).exec();
            res.status(200).json({ message: 'Fabrique trouvée', status: 'OK', data: fabrique });
        } catch (error) {
            res.status(400).json({ message: 'Fabrique introuvable', status: 'NOT OK', data: error });
        }
    }
    async update(req, res) {
        try {
            const { nom, contact, region, pays } = req.body;
            const fabrique = await Fabrique.findById(req.params.id).exec();

            Object.assign(fabrique, { nom, contact, region, pays });
            await fabrique.save();
            res.status(200).json({ message: 'Modification réussie', status: 'OK', data: fabrique });
        } catch (error) {
            res.status(400).json({ message: 'Erreur de modification', status: 'NOT OK', data: error });
        }
    }
    async delete(req, res) {
        try {
            await Fabrique.findByIdAndDelete(req.params.id);
            res.status(200).json({ message: 'Suppression réussie', status: 'OK' });
        } catch (error) {
            res.status(400).json({ message: 'Erreur de suppression', status: 'NOT OK', data: error });
        }
    }
    async findByName(req, res) {
        try {
            const fabrique = await Fabrique.findOne({ nom: req.params.nom }).exec();
            res.status(200).json({ message: 'Fabrique trouvée', status: 'OK', data: fabrique });
        } catch (error) {
            res.status(400).json({ message: 'Fabrique introuvable', status: 'NOT OK', data: error });
        }
    }
    async findByRegion(req, res) {
        try {
            const fabriques = await Fabrique.find({ region: req.params.region }).exec();
            res.status(200).json({ message: 'Fabriques trouvées', status: 'OK', data: fabriques });
        } catch (error) {
            res.status(400).json({ message: 'Erreur de récupération', status: 'NOT OK', data: error });
        }
    }
    async findByPays(req, res) {
        try {
            const fabriques = await Fabrique.find({ pays: req.params.pays }).exec();
            res.status(200).json({ message: 'Fabriques trouvées', status: 'OK', data: fabriques });
        } catch (error) {
            res.status(400).json({ message: 'Erreur de récupération', status: 'NOT OK', data: error });
        }
    }
    


}

module.exports = new FabriqueController();