
const { DateTime } = require('luxon');
const formulaireModel = require('../models/formulaire');

const sondeeModel = require('../models/sonde-formulaire');
const fileModel = require('../models/file');
const reader = require('xlsx');
const path = require('path');

const nodemailer = require("nodemailer");

const mongoose = require('mongoose');

const objectPopulate = [{
    path: 'folderForm'
}, {
    path: 'logo',
}, {
    path: 'cover',
}];


exports.add = async (req,res) => {

    let { titre, description , folder } = req.body ;

    console.log("folder");
    console.log(folder);
    

    const formulaire = formulaireModel();

    formulaire.titre = titre;

    formulaire.description = description;

    formulaire.admin = req.user.id_user;

    if(folder != undefined) {
        formulaire.folderForm = folder;
    }

    formulaire.date = DateTime.now();

    const formulaireSave = await formulaire.save();

    const form =await formulaireModel.findById(formulaireSave.id).populate(objectPopulate);

    console.log("form");
    console.log(form);
    

    return res.status(201).json({
        message: 'formulaire crée avec succes',
        status: 'OK',
        data: form,
        statusCode: 201
});

   try {
    
    
   } catch (error) {
        return  res.status(404).json({
            message: 'Erreur creation',
            status: 'OK',
            data: error,
            statusCode: 404
        });
   }

}

exports.sendMailFormulaire = async (req,res) => {




    try {




      
    let {
        emails,
        object,
        message,
        inclureForm,
        inclurePassword,
        idFormulaire
    } = req.body ;

    console.log(emails);


    for await (const element of emails) {


        
        
        
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


        

        const sonde = sondeeModel();

        var mailOptions = {};


        var password = require('randomstring').generate(8);

        passwordCrypt = require('bcryptjs').hashSync( password, require('bcryptjs').genSaltSync(10));

        sonde.email = element;

        sonde.form = idFormulaire;


        if(inclurePassword =='1') {

            sonde.password = password;

            if(inclureForm == '1') {

              
                // Définir les informations de l'e-mail
                   mailOptions = {
                   from: '"Suport" <simplon@simplonsolution.com>',
                   to: element,
                   subject: object,
                   html: ` ${message} <strong> <a href ="https://test-diack.nataal.shop/formulaire-view-sonde/${idFormulaire}?email=${element}">cliquez ici pour acceder au formulaire. </a></strong> </br> Voici votre mot de passe pour vous connecter sur la plate-forme : <strong>${password}</strong>  `,
               };

           }else {
                    // Définir les informations de l'e-mail
                   mailOptions = {
                       from: '"Suport"<simplon@simplonsolution.com>',
                       to: element,
                       subject: object,
                       html: ` ${message} </br> Voici votre mot de passe pour vous connecter sur la plate-forme : <strong>${password}</strong>  `,
                   };
           }
        }else {


            if(inclureForm == '1') {

                    sonde.password = password;


              
                 // Définir les informations de l'e-mail
                    mailOptions = {
                    from: '"Suport" <simplon@simplonsolution.com>',
                    to: element,
                    subject: object,
                    html: ` ${message} <strong> <a href ="https://test-diack.nataal.shop/formulaire-view/66fd56d81d1b6d379b695f9c">cliquez ici pour acceder au formulaire </a></strong> </br> Voici votre mot de passe pour vous connecter sur la plate-forme : <strong>${password}</strong>  `,
                };

            }else {
                     // Définir les informations de l'e-mail
                    mailOptions = {
                        from: 'admin@cds-toubaouest.fr',
                        to: element,
                        subject: object,
                        html: ` ${message} `,
                    };
            }

        }

        const sondeSave = await sonde.save();
       
        console.log(sondeSave);
        

        
        // Envoyer l'e-mail
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Erreur lors de l\'envoi de l\'e-mail:', error);

            } else {
                console.log(info);
                
                console.log('E-mail envoyé avec succès:', info.response);

            }
        });

    }

    return  res.status(201).json({
        message: 'Envoie des mails reussi creation',
        status: 'OK',
        data: 'success',
        statusCode: 201
    });
    
    
        
    } catch (error) {
        return  res.status(404).json({
            message: 'Erreur creation',
            status: 'OK',
            data: error,
            statusCode: 404
        });
    }

}

exports.getAllEmail = async (req,res) => {

    let {id} = req.query;

    const fileExel = await  fileModel.findById(id).exec();

    console.log(fileExel);
    
   // Reading our test file
   const file = reader.readFile(path.join(__dirname, '..', 'uploads', fileExel['url'] ));

   let data = []

   const sheets = file.SheetNames

   for(let i = 0; i < sheets.length; i++)
   {
   const temp = reader.utils.sheet_to_json(
           file.Sheets[file.SheetNames[i]])
   temp.forEach((res) => {
       data.push(res.email)
   })
   }

   // Printing data
   
   
   console.log(data)
   
   return res.json({
    email : data
   });

   
}


exports.update = async (req,res) => {

    

    try {
        let { titre, description , champs , folder , cover , logo } = req.body ;
 
        const formulaire = await  formulaireModel.findById(req.params.id);
    
        if(titre != undefined) {
           formulaire.titre = titre;
        }
    
        if(description != undefined) {
           formulaire.description = description;
        }

        if(folder != undefined) {
            formulaire.folderForm = folder;
        }
    
    
        if(champs != undefined) {
           formulaire.champs = champs;
        }

        if(cover != undefined) {
            formulaire.cover = cover;
         }

         if(logo != undefined) {
            formulaire.logo = logo;
         }
    
    
        const formulaireSave = await formulaire.save();

        const f = await formulaireModel.findById(req.params.id).populate(objectPopulate);
    
        return res.status(200).json({
            message: 'formulaire crée avec succes',
            status: 'OK',
            data: f,
            statusCode: 200
    });
     
    } catch (error) {
         return  res.status(404).json({
             message: 'Erreur creation',
             status: 'OK',
             data: error,
             statusCode: 404
         });
    }
 
 }
 


exports.one = async (req,res) => {

    

    
   

    try {

        
        const f = await   formulaireModel.findById(req.params.id).exec();


    

        let formulaire ;

        if (f.folderForm == null) {
            formulaire = await   formulaireModel.findById(req.params.id).populate('cover logo').exec();
        } else {
            formulaire = await   formulaireModel.findById(req.params.id).populate(objectPopulate).exec();
        }
    
    
    

        return res.status(200).json({
            message: 'formulaire crée avec succes',
            status: 'OK',
            data: formulaire,
            statusCode: 200
        });

        
    } catch (error) {
        return  res.status(404).json({
            message: 'Erreur creation',
            status: 'OK',
            data: error,
            statusCode: 404
        });
    }

}


exports.allByUser = async (req,res) => {
   
    try {

        const formulaire = await formulaireModel.find({ admin : req.user.id_user }).populate(objectPopulate).exec();

        return res.status(200).json({
            message: 'formulaire crée avec succes',
            status: 'OK',
            data: formulaire,
            statusCode: 200
    });


        
    } catch (error) {
        return  res.status(404).json({
            message: 'Erreur creation',
            status: 'OK',
            data: error,
            statusCode: 404
        });
    }

}

exports.all = async (req,res) => {


    try {

        const formulaire = await formulaireModel.find({});

        return res.status(200).json({
            message: 'formulaire crée avec succes',
            status: 'OK',
            data: formulaire,
            statusCode: 200
    });

        
    } catch (error) {
        return  res.status(404).json({
            message: 'Erreur creation',
            status: 'OK',
            data: error,
            statusCode: 404
        });
    }

}


exports.delete = async (req,res) => {
   

    try {

        console.log("req.params.id");
        console.log(req.params.id);
        console.log("req.user.id_user");
        console.log(req.user.id_user);
        


        const formulaire = await formulaireModel.findOneAndDelete({
            _id :req.params.id ,
            admin : req.user.id_user
        });

       if(formulaire !=null) {
        return res.status(200).json({
            message: 'formulaire crée avec succes',
            status: 'OK',
            data: formulaire,
            statusCode: 200
        }); 

       }else {
            return res.status(404).json({
                message: 'ce formulaire ne vous appartient pas ',
                status: 'OK',
                data: null,
                statusCode: 404
            }); 
       }
        
    } catch (error) {
        return  res.status(404).json({
            message: 'Erreur creation',
            status: 'OK',
            data: error,
            statusCode: 404
        });
    }
}