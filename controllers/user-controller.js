const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/user');
const SondeFormulaire = require('../models/sonde-formulaire');


class UserController  {

    async store(req, res, next) {
        try {
            let { type, nom, password, prenom, adresse, fonction, email, telephone } = req.body;
            const user = new User();
            let passwordCrypt = bcrypt.hashSync(password || 'passer123', bcrypt.genSaltSync(10));

            Object.assign(user, { type, nom, prenom, adresse, fonction, email, telephone, password: passwordCrypt });

            user.token = jwt.sign({
                id_user: user.id,
                role_user: user.type
            }, process.env.JWT_SECRET, { expiresIn: '8784h' });

            await user.save();
            await this.sendEmail(email, password ? 'Mot de passe défini' : 'Mot de passe par défaut', `Votre compte a été créé. Votre mot de passe est ${password || 'passer123'}`);

            res.status(201).json({ message: 'Utilisateur créé avec succès', status: 'OK', data: user });
        } catch (error) {
            res.status(400).json({ message: 'Erreur de création', status: 'NOT OK', data: error });
        }
    }

    async auth(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email }).exec();
            if (user && bcrypt.compareSync(password, user.password)) {
                user.token = jwt.sign({ id_user: user.id, role_user: user.type }, process.env.JWT_SECRET, { expiresIn: '8784h' });
                await user.save();
                res.status(200).json({ message: 'Connexion réussie', status: 'OK', data: user });
            } else {
                res.status(404).json({ message: 'Identifiants incorrects', status: 'NOT OK' });
            }
        } catch (error) {
            res.status(400).json({ message: 'Erreur de connexion', status: 'NOT OK', data: error });
        }
    }

    async authSonde(req, res) {
        try {
            const { email, password, idForm } = req.body;
            const user = await SondeFormulaire.findOne({ email, form: idForm, password }).exec();
            if (user) {
                user.token = jwt.sign({ id_user: user.id, role_user: 'sonde' }, process.env.JWT_SECRET, { expiresIn: '8784h' });
                user.aRepondu = '1';
                await user.save();
                res.status(200).json({ message: 'Connexion réussie', status: 'OK', data: user });
            } else {
                res.status(404).json({ message: 'Identifiants incorrects', status: 'NOT OK' });
            }
        } catch (error) {
            res.status(400).json({ message: 'Erreur de connexion', status: 'NOT OK', data: error });
        }
    }

    async getAuth(req, res) {
        try {
            const user = await User.findById(req.user.id_user).exec();
            res.status(200).json({ message: 'Utilisateur trouvé', status: 'OK', data: user });
        } catch (error) {
            res.status(400).json({ message: 'Utilisateur introuvable', status: 'NOT OK', data: error });
        }
    }

    async all(req, res) {
        try {
            const users = await User.find(req.query).exec();
            res.status(200).json({ message: 'Utilisateurs trouvés', status: 'OK', data: users });
        } catch (error) {
            res.status(400).json({ message: 'Erreur de récupération', status: 'NOT OK', data: error });
        }
    }

    async one(req, res) {
        try {
            const user = await User.findById(req.params.id).exec();
            res.status(200).json({ message: 'Utilisateur trouvé', status: 'OK', data: user });
        } catch (error) {
            res.status(400).json({ message: 'Utilisateur introuvable', status: 'NOT OK', data: error });
        }
    }

    async update(req, res) {
        try {
            const { type, nom, password, newpassWord, prenom, adresse, fonction, email, telephone } = req.body;
            const user = await User.findById(req.params.id).exec();

            if (password && bcrypt.compareSync(password, user.password)) {
                user.password = bcrypt.hashSync(newpassWord, bcrypt.genSaltSync(10));
            }

            Object.assign(user, { type, nom, prenom, adresse, fonction, email, telephone });
            await user.save();
            res.status(200).json({ message: 'Modification réussie', status: 'OK', data: user });
        } catch (error) {
            res.status(400).json({ message: 'Erreur de modification', status: 'NOT OK', data: error });
        }
    }

    async delete(req, res) {
        try {
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json({ message: 'Suppression réussie', status: 'OK' });
        } catch (error) {
            res.status(400).json({ message: 'Erreur de suppression', status: 'NOT OK', data: error });
        }
    }

    async sendEmail(to, subject, html) {
        const transporter = nodemailer.createTransport({
            service: 'SMTP',
            host: 'mail.simplonsolution.com',
            port: 465,
            secure: true,
            auth: { user: 'simplon@simplonsolution.com', pass: 'Bonjour2024@' }
        });
        await transporter.sendMail({ from: '"Support" <simplon@simplonsolution.com>', to, subject, html });
    }
}

module.exports = new UserController();
