


exports.store = async (req, res, next) => {

    try {

        let {
            type,
            nom,
            password,
            prenom,
            adresse,
            fonction,
            email,
            telephone,
        } = req.body;

        const user = require('../models/user')();

        let passwordCrypt = require('bcryptjs').hashSync("passer123", require('bcryptjs').genSaltSync(10))

        if (password != undefined) {
            passwordCrypt = require('bcryptjs').hashSync(password, require('bcryptjs').genSaltSync(10));
        }

        if (type != undefined) {
            user.type = type;
        }


        user.nom = nom;

        user.email = email;

        user.password = passwordCrypt;

        user.prenom = prenom;

        user.adresse = adresse;

        user.fonction = fonction;

        user.telephone = telephone;

        user.token = require('jsonwebtoken').sign({
            id_user: user.id,
            role_user: user.type,
        }, process.env.JWT_SECRET, { expiresIn: '8784h' });

        const userSave = await user.save();

        if (password == undefined) {
            // Configurer le transporteur SMTP

            const transporter = require('nodemailer').createTransport({
                service: 'SMTP',
                host: 'mail.simplonsolution.com', // 'ssl0.ovh.net',
                port: 465,
                secure: true, // Utilisez true si vous utilisez SSL/TLS
                auth: {
                    user: 'simplon@simplonsolution.com',
                    pass: 'Bonjour2024@'
                }
            });
    


            // Définir les informations de l'e-mail
            const mailOptions = {
                from: '"Suport" <simplon@simplonsolution.com>',
                to: email,
                subject: 'création de votre simplon formulaire',
                html: `votre compte viens d'être crééer  allez vous conecter sur le lien <strong> <a href ="http://testing.simplonsolution.com/">ci-aprés</a></strong> veuillez vous connecter pour completer votre profile. <br/> Votre mot de passe est passer123`,
            };
            // Envoyer l'e-mail
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Erreur lors de l\'envoi de l\'e-mail:', error);

                } else {
                    console.log('E-mail envoyé avec succès:', info.response);

                }
            });

        } else {


            const transporter = require('nodemailer').createTransport({
                service: 'SMTP',
                host: 'mail.simplonsolution.com', // 'ssl0.ovh.net',
                port: 465,
                secure: true, // Utilisez true si vous utilisez SSL/TLS
                auth: {
                    user: 'simplon@simplonsolution.com',
                    pass: 'Bonjour2024@'
                }
            });


            // Définir les informations de l'e-mail
            const mailOptions = {
                from: '"Suport" <simplon@simplonsolution.com>',
                to: email,
                subject: 'création de votre simplon formulaire',
                html: `votre compte viens d'être crééer  allez vous conecter sur le lien <strong> <a href ="http://testing.simplonsolution.com/">ci-aprés</a></strong> veuillez vous connecter pour completer votre profile. <br/> Votre mot de passe est passer123`,
            };
            // Envoyer l'e-mail
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Erreur lors de l\'envoi de l\'e-mail:', error);

                } else {
                    console.log('E-mail envoyé avec succès:', info.response);

                }
            });
        }



        return res.status(201).json({
            message: 'user crée avec succes',
            status: 'OK',
            data: userSave,
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
exports.auth = async (req, res) => {

    let { password, email } = req.body;

    const findUserAdmin = await require('../models/user').findOne({
        email: email
    }).exec();
    
    if (findUserAdmin != undefined) {
        if (require('bcryptjs').compareSync(password, findUserAdmin.password)) {

            const token = require('jsonwebtoken').sign({
                id_user: findUserAdmin.id,
                role_user: findUserAdmin.type,
            }, process.env.JWT_SECRET, { expiresIn: '8784h' });

            findUserAdmin.token = token;

            const saveUserAdmin = await findUserAdmin.save();

            return res.status(200).json({
                message: 'Connection réussi',
                status: 'OK',
                data: saveUserAdmin,
                statusCode: 200
            });
        } else {
            return res.status(404).json({
                message: 'Identifiant incorrect',
                status: 'NOT OK',
                data: null,
                statusCode: 404
            });
        }
    } else {
        return res.status(404).json({
            message: 'Identifiant incorrect',
            status: 'NOT OK',
            data: null,
            statusCode: 404
        });
    }

    try {

        


    } catch (error) {
        return res.status(404).json({
            message: 'erreur server ',
            status: 'NOT OK',
            data: error,
            statusCode: 404
        });
    }

}

exports.authsonde = async (req,res) => {

    
    


    try {

        let { password, email , idForm } = req.body;

    console.log(req.body);

    const findUserAdmin = await require('../models/sonde-formulaire').findOne({
        email: email,
        form : idForm,
        password :password
    }).exec();

    console.log(findUserAdmin);
    

    if (findUserAdmin != null) {

        const token = require('jsonwebtoken').sign({
            id_user: findUserAdmin.id,
            role_user: 'sonde',
        }, process.env.JWT_SECRET, { expiresIn: '8784h' });

        findUserAdmin.token = token;
        findUserAdmin.aRepondu = '1';

        const saveUserAdmin = await findUserAdmin.save();

        return res.status(200).json({
            message: 'Connection réussi',
            status: 'OK',
            data: saveUserAdmin,
            statusCode: 200
        });
    } else {
        return res.status(404).json({
            message: 'Identifiant incorrect',
            status: 'NOT OK',
            data: null,
            statusCode: 404
        });
    }
    

    } catch (error) {
        return res.status(404).json({
            message: 'erreur server ',
            status: 'NOT OK',
            data: error,
            statusCode: 404
        });
    }

}


exports.getAuth = async (req, res) => {

    try {
        const user = await require('../models/user').findById(req.user.id_user).exec();
        res.json({
            message: 'user trouvée avec succes',
            status: 'OK',
            data: user,
            statusCode: 200
        })
    } catch (error) {
        res.status(404).json({
            message: 'user non trouvée',
            status: 'OK',
            data: error,
            statusCode: 400
        })
    }
}

exports.all = async (req, res, next) => {

    try {
        const user = await require('../models/user').find(req.query).exec();
        res.json({
            message: 'user trouvée avec succes',
            status: 'OK',
            data: user,
            statusCode: 200
        })
    } catch (error) {
        res.status(404).json({
            message: 'user  non trouvée',
            status: 'OK',
            data: error,
            statusCode: 400
        })
    }
}

exports.one = async (req, res, next) => {
    try {
        const user = await require('../models/user').findById(req.params.id).exec();
        res.json({
            message: 'user trouvée avec succes',
            status: 'OK',
            data: user,
            statusCode: 200
        })
    } catch (error) {
        res.status(404).json({
            message: 'user non trouvée',
            status: 'OK',
            data: error,
            statusCode: 400
        })
    }
}

exports.update = async (req, res, next) => {

    try {
        let {
            type,
            nom,
            password,
            newpassWord,
            prenom,
            adresse,
            fonction,
            email,
            telephone,
        } = req.body;

        const user = await require('../models/user').findById(req.params.id).exec();


        if (type != undefined) {

            user.type = type;

        }

        if (nom != undefined) {

            user.nom = nom;

        }

        if (password != undefined) {

            if (bcrytjs.compareSync(password, user.password)) {


                const passwordCrypt = require('bcryptjs').hashSync(newpassWord, require('bcryptjs').genSaltSync(10));

                user.password = passwordCrypt;
            }


        }

        if (prenom != undefined) {

            user.prenom = prenom;

        }

        if (adresse != undefined) {

            user.adresse = adresse;

        }

        if (fonction != undefined) {

            user.fonction = fonction;

        }

        if (email != undefined) {

            user.email = email;

        }

        if (telephone != undefined) {

            user.telephone = telephone;

        }

        const userSave = await user.save();


        res.json({
            message: 'modification user réussi',
            status: 'OK',
            data: userSave,
            statusCode: 200
        });

    } catch (error) {
        res.status(404).json({
            message: 'user non modifie',
            status: 'NOT OK',
            data: error,
            statusCode: 400
        })
    }


}

exports.delete = (req, res, next) => require('../models/user').findByIdAndDelete(req.params.id).then(result => {
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