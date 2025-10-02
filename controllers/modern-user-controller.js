const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

/**
 * Contrôleur utilisateur amélioré avec système de création de mot de passe par email
 */
class ModernUserController {
  
  /**
   * Créer un nouvel utilisateur sans mot de passe et envoyer un email d'invitation
   */
  static async createUserWithInvitation(req, res) {
    try {
      const {
        type,
        nom,
        prenom,
        adresse,
        fonction,
        email,
        telephone,
      } = req.body;

      // Vérifier si l'email existe déjà
      const User = require('../models/user');
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Un utilisateur avec cet email existe déjà',
          statusCode: 400
        });
      }

      // Générer un token de réinitialisation de mot de passe
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

      // Créer l'utilisateur sans mot de passe définitif
      const user = require('../models/user')();
      
      user.type = type || 'sondeur';
      user.nom = nom;
      user.prenom = prenom;
      user.adresse = adresse;
      user.fonction = fonction;
      user.email = email;
      user.telephone = telephone;
      user.password = bcrypt.hashSync('temp_password_' + Date.now(), 10);
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = resetTokenExpiry;
      user.isPasswordSet = false;
      user.token = jwt.sign(
        { id_user: '', role_user: type || 'sondeur' },
        process.env.JWT_SECRET,
        { expiresIn: '8784h' }
      );

      // Sauvegarder l'utilisateur
      const savedUser = await user.save();

      // Mettre à jour le token avec l'ID correct
      savedUser.token = jwt.sign(
        { id_user: savedUser._id, role_user: savedUser.type },
        process.env.JWT_SECRET,
        { expiresIn: '8784h' }
      );
      await savedUser.save();

      // Envoyer l'email d'invitation
      const emailSent = await ModernUserController.sendPasswordSetupEmail(
        savedUser.email,
        savedUser.prenom,
        savedUser.nom,
        resetToken
      );

      if (!emailSent) {
        console.warn('Erreur lors de l\'envoi de l\'email, mais utilisateur créé');
      }

      // Enregistrer l'activité
      await ModernUserController.logActivity('user_created', 
        `Nouvel utilisateur ${savedUser.prenom} ${savedUser.nom} créé`, 
        req.userId || 'admin',
        {
          userId: savedUser._id,
          userEmail: savedUser.email,
          userType: savedUser.type
        }
      );

      return res.status(201).json({
        status: 'OK',
        message: 'Utilisateur créé avec succès. Un email d\'invitation a été envoyé.',
        data: {
          id: savedUser._id,
          nom: savedUser.nom,
          prenom: savedUser.prenom,
          email: savedUser.email,
          type: savedUser.type,
          fonction: savedUser.fonction,
          isPasswordSet: savedUser.isPasswordSet
        },
        statusCode: 201
      });

    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      return res.status(500).json({
        status: 'ERROR',
        message: 'Erreur serveur lors de la création de l\'utilisateur',
        data: error.message,
        statusCode: 500
      });
    }
  }

  /**
   * Envoyer un email avec le lien de création de mot de passe
   */
  static async sendPasswordSetupEmail(email, prenom, nom, resetToken) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'SMTP',
        host: 'mail.simplonsolution.com',
        port: 465,
        secure: true,
        auth: {
          user: 'simplon@simplonsolution.com',
          pass: 'Bonjour2024@'
        }
      });

      const resetUrl = `https://test-diag.saharux.com/set-password?token=${resetToken}`;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Création de votre compte Simplon Formulaire</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Bienvenue ${prenom} !</h1>
                    <p>Votre compte Simplon Formulaire a été créé</p>
                </div>
                <div class="content">
                    <h2>Bonjour ${prenom} ${nom},</h2>
                    <p>Votre compte sur la plateforme <strong>Simplon Formulaire</strong> vient d'être créé avec succès !</p>
                    
                    <p>Pour finaliser la configuration de votre compte, vous devez créer votre mot de passe en cliquant sur le bouton ci-dessous :</p>
                    
                    <div style="text-align: center;">
                        <a href="${resetUrl}" class="button">Créer mon mot de passe</a>
                    </div>
                    
                    <div class="warning">
                        <strong>⚠️ Important :</strong> Ce lien est valide pendant 24 heures uniquement.
                    </div>
                    
                    <p>Si le bouton ne fonctionne pas, vous pouvez copier-coller ce lien dans votre navigateur :</p>
                    <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 4px;">${resetUrl}</p>
                    
                    <h3>Informations de votre compte :</h3>
                    <ul>
                        <li><strong>Email :</strong> ${email}</li>
                        <li><strong>Nom :</strong> ${nom}</li>
                        <li><strong>Prénom :</strong> ${prenom}</li>
                    </ul>
                    
                    <p>Une fois votre mot de passe créé, vous pourrez accéder à toutes les fonctionnalités de la plateforme.</p>
                </div>
                <div class="footer">
                    <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
                    <p>© 2025 Simplon Solution - Tous droits réservés</p>
                </div>
            </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: '"Simplon Formulaire" <simplon@simplonsolution.com>',
        to: email,
        subject: '🔐 Créez votre mot de passe - Simplon Formulaire',
        html: htmlContent
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email d\'invitation envoyé avec succès:', info.response);
      return true;

    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      return false;
    }
  }

  /**
   * Vérifier et valider un token de réinitialisation de mot de passe
   */
  static async validatePasswordResetToken(req, res) {
    try {
      const { token } = req.params;
      const User = require('../models/user');

      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Token invalide ou expiré',
          statusCode: 400
        });
      }

      return res.json({
        status: 'OK',
        message: 'Token valide',
        data: {
          email: user.email,
          nom: user.nom,
          prenom: user.prenom
        }
      });

    } catch (error) {
      console.error('Erreur lors de la validation du token:', error);
      return res.status(500).json({
        status: 'ERROR',
        message: 'Erreur serveur',
        statusCode: 500
      });
    }
  }

  /**
   * Définir le mot de passe avec le token de réinitialisation
   */
  static async setPasswordWithToken(req, res) {
    try {
      const { token } = req.params;
      const { password, confirmPassword } = req.body;
      const User = require('../models/user');

      // Vérifications
      if (!password || password.length < 8) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Le mot de passe doit contenir au moins 8 caractères',
          statusCode: 400
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Les mots de passe ne correspondent pas',
          statusCode: 400
        });
      }

      // Trouver l'utilisateur avec le token valide
      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Token invalide ou expiré',
          statusCode: 400
        });
      }

      // Mettre à jour le mot de passe
      user.password = bcrypt.hashSync(password, 10);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.isPasswordSet = true;
      
      await user.save();

      // Enregistrer l'activité
      await ModernUserController.logActivity('password_set', 
        `Mot de passe défini pour ${user.prenom} ${user.nom}`, 
        user._id,
        {
          userEmail: user.email
        }
      );

      return res.json({
        status: 'OK',
        message: 'Mot de passe défini avec succès. Vous pouvez maintenant vous connecter.',
        statusCode: 200
      });

    } catch (error) {
      console.error('Erreur lors de la définition du mot de passe:', error);
      return res.status(500).json({
        status: 'ERROR',
        message: 'Erreur serveur',
        statusCode: 500
      });
    }
  }

  /**
   * Renvoyer un email d'invitation
   */
  static async resendInvitation(req, res) {
    try {
      const { userId } = req.params;
      const User = require('../models/user');

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: 'ERROR',
          message: 'Utilisateur non trouvé',
          statusCode: 404
        });
      }

      if (user.isPasswordSet) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'L\'utilisateur a déjà défini son mot de passe',
          statusCode: 400
        });
      }

      // Générer un nouveau token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      user.passwordResetToken = resetToken;
      user.passwordResetExpires = resetTokenExpiry;
      await user.save();

      // Renvoyer l'email
      const emailSent = await ModernUserController.sendPasswordSetupEmail(
        user.email,
        user.prenom,
        user.nom,
        resetToken
      );

      if (!emailSent) {
        return res.status(500).json({
          status: 'ERROR',
          message: 'Erreur lors de l\'envoi de l\'email',
          statusCode: 500
        });
      }

      return res.json({
        status: 'OK',
        message: 'Email d\'invitation renvoyé avec succès',
        statusCode: 200
      });

    } catch (error) {
      console.error('Erreur lors du renvoi de l\'invitation:', error);
      return res.status(500).json({
        status: 'ERROR',
        message: 'Erreur serveur',
        statusCode: 500
      });
    }
  }

  /**
   * Enregistrer une activité (utilise le modèle d'activité si disponible)
   */
  static async logActivity(type, message, userId, metadata = {}) {
    try {
      // Essayer d'utiliser le modèle d'activité si disponible
      const activityModel = require('../models/activity-model');
      if (activityModel && activityModel.create) {
        activityModel.create({
          type,
          message,
          userId,
          metadata
        });
      }
    } catch (error) {
      console.log('Impossible d\'enregistrer l\'activité:', error.message);
    }
  }
}

module.exports = ModernUserController;