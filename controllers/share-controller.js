const Share = require('../models/share-model');
const ScheduledEmail = require('../models/scheduled-email-model');
const Formulaire = require('../models/formulaire');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

class ShareController {
  
  /**
   * Générer un lien de partage
   */
  async generateShare(req, res) {
    try {
      console.log('DEBUG ShareController: Début generateShare');
      console.log('DEBUG ShareController: req.body =', req.body);
      console.log('DEBUG ShareController: req.user =', req.user);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('DEBUG ShareController: Erreurs de validation:', errors.array());
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { formulaireId, requirePassword, customPassword, expiryDate, maxUses, isPublic } = req.body;
      
      console.log('DEBUG ShareController: Données extraites:', {
        formulaireId,
        requirePassword,
        customPassword: customPassword ? '[SET]' : '[UNSET]',
        expiryDate,
        maxUses,
        isPublic
      });

      // Vérifier que le formulaire existe et appartient à l'utilisateur
      console.log('DEBUG ShareController: Recherche du formulaire avec ID:', formulaireId);
      const formulaire = await Formulaire.findById(formulaireId);
      if (!formulaire) {
        console.log('DEBUG ShareController: Formulaire non trouvé');
        return res.status(404).json({
          success: false,
          message: 'Formulaire non trouvé'
        });
      }

      console.log('DEBUG ShareController: Formulaire trouvé:', {
        id: formulaire._id,
        admin: formulaire.admin,
        titre: formulaire.titre
      });
      console.log('DEBUG ShareController: User ID:', req.user.id_user);

      if (formulaire.admin.toString() !== req.user.id_user) {
        console.log('DEBUG ShareController: Accès refusé - admin ne correspond pas');
        return res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
      }

      // Générer un ID unique pour le partage
      const shareId = crypto.randomUUID();
      const shareUrl = `${process.env.FRONTEND_URL}/sonde/formulaire/${shareId}`;
      
      console.log('DEBUG ShareController: Génération du partage:', {
        shareId,
        shareUrl
      });

      // Hasher le mot de passe si fourni
      let hashedPassword = null;
      if (requirePassword && customPassword) {
        hashedPassword = await bcrypt.hash(customPassword, 10);
        console.log('DEBUG ShareController: Mot de passe hashé');
      }

      // Créer le lien de partage
      const share = new Share({
        formulaireId,
        shareId,
        shareUrl,
        createdBy: req.user.id_user,
        settings: {
          requirePassword,
          password: hashedPassword,
          isPublic,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          maxUses
        }
      });

      console.log('DEBUG ShareController: Sauvegarde du partage...');
      await share.save();
      console.log('DEBUG ShareController: Partage sauvegardé avec succès');
      console.log('DEBUG ShareController: Share ID en base:', share._id);
      console.log('DEBUG ShareController: ShareURL en base:', share.shareUrl);

      // Vérifier que le partage a bien été sauvegardé
      const savedShare = await Share.findOne({ shareUrl });
      console.log('DEBUG ShareController: Vérification de sauvegarde:', savedShare ? 'TROUVÉ' : 'NON TROUVÉ');
      if (savedShare) {
        console.log('DEBUG ShareController: ID trouvé:', savedShare._id);
        console.log('DEBUG ShareController: URL trouvée:', savedShare.shareUrl);
      }

      // Retourner les informations (sans le mot de passe hashé)
      const shareData = share.toObject();
      delete shareData.settings.password;

      console.log('DEBUG ShareController: Retour des données:', shareData);

      res.status(201).json({
        success: true,
        message: 'Lien de partage généré avec succès',
        data: shareData
      });

    } catch (error) {
      console.error('ERREUR ShareController generateShare:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

  /**
   * Envoyer le lien par email
   */
  async sendEmail(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { formulaireId, shareUrl, recipients, subject, message, password, includePassword } = req.body;

      // Vérifier que le formulaire existe et appartient à l'utilisateur
      const formulaire = await Formulaire.findById(formulaireId);
      if (!formulaire) {
        return res.status(404).json({
          success: false,
          message: 'Formulaire non trouvé'
        });
      }

      if (formulaire.admin.toString() !== req.user.id_user) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
      }

      // Configuration du transporteur email
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      // Construire le message email
      let emailContent = `
        <h2>${subject}</h2>
        <p>${message}</p>
        
        <p>Cliquez sur le lien suivant pour accéder au formulaire :</p>
        <p><a href="${shareUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accéder au formulaire</a></p>
        
        <p>Ou copiez et collez ce lien dans votre navigateur :</p>
        <p>${shareUrl}</p>
      `;

      if (includePassword && password) {
        emailContent += `
          <p><strong>Mot de passe requis :</strong> ${password}</p>
        `;
      }

      emailContent += `
        <hr>
        <p><small>Ce message a été envoyé automatiquement. Merci de ne pas répondre à cet email.</small></p>
      `;

      // Envoyer l'email à tous les destinataires
      const emailPromises = recipients.map(recipient => {
        return transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: recipient,
          subject: subject,
          html: emailContent
        });
      });

      await Promise.all(emailPromises);

      // Mettre à jour les statistiques
      const share = await Share.findOne({ shareUrl });
      if (share) {
        await share.incrementEmailsSent(recipients.length);
      }

      res.json({
        success: true,
        message: `Emails envoyés avec succès à ${recipients.length} destinataire(s)`
      });

    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email'
      });
    }
  }

  /**
   * Programmer l'envoi d'un email
   */
  async scheduleEmail(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { 
        formulaireId, 
        shareUrl, 
        recipients, 
        scheduledDate, 
        subject, 
        message, 
        password, 
        includePassword, 
        recurring, 
        recurringPattern 
      } = req.body;

      // Vérifier que le formulaire existe et appartient à l'utilisateur
      const formulaire = await Formulaire.findById(formulaireId);
      if (!formulaire) {
        return res.status(404).json({
          success: false,
          message: 'Formulaire non trouvé'
        });
      }

      if (formulaire.admin.toString() !== req.user.id_user) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
      }

      // Vérifier que la date programmée est dans le futur
      const scheduled = new Date(scheduledDate);
      if (scheduled <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'La date programmée doit être dans le futur'
        });
      }

      // Trouver le lien de partage correspondant
      const share = await Share.findOne({ shareUrl });
      if (!share) {
        return res.status(404).json({
          success: false,
          message: 'Lien de partage non trouvé'
        });
      }

      // Créer l'email programmé
      const scheduledEmail = new ScheduledEmail({
        formulaireId,
        shareId: share._id,
        createdBy: req.user.id_user,
        recipients,
        subject,
        message,
        shareUrl,
        password,
        includePassword,
        scheduledDate: scheduled,
        recurring,
        recurringPattern,
        totalRecipients: recipients.length
      });

      await scheduledEmail.save();

      res.status(201).json({
        success: true,
        message: 'Email programmé avec succès',
        data: scheduledEmail
      });

    } catch (error) {
      console.error('Erreur lors de la programmation de l\'email:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

  /**
   * Obtenir les statistiques de partage
   */
  async getStats(req, res) {
    try {
      const { formulaireId } = req.params;

      // Vérifier que le formulaire existe et appartient à l'utilisateur
      const formulaire = await Formulaire.findById(formulaireId);
      if (!formulaire) {
        return res.status(404).json({
          success: false,
          message: 'Formulaire non trouvé'
        });
      }

      if (formulaire.admin.toString() !== req.user.id_user) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
      }

      // Obtenir les statistiques
      const shares = await Share.find({ formulaireId, active: true });
      
      const stats = {
        totalLinks: shares.length,
        totalViews: shares.reduce((sum, share) => sum + share.stats.views, 0),
        totalResponses: shares.reduce((sum, share) => sum + share.stats.responses, 0),
        emailsSent: shares.reduce((sum, share) => sum + share.stats.emailsSent, 0)
      };

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

  /**
   * Obtenir les liens actifs
   */
  async getActiveLinks(req, res) {
    try {
      const { formulaireId } = req.params;

      // Vérifier que le formulaire existe et appartient à l'utilisateur
      const formulaire = await Formulaire.findById(formulaireId);
      if (!formulaire) {
        return res.status(404).json({
          success: false,
          message: 'Formulaire non trouvé'
        });
      }

      if (formulaire.admin.toString() !== req.user.id_user) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
      }

      // Obtenir les liens actifs
      const shares = await Share.find({ formulaireId, active: true })
        .select('-settings.password')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: shares
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des liens actifs:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

  /**
   * Révoquer un lien de partage
   */
  async revokeLink(req, res) {
    try {
      const { shareId } = req.params;

      const share = await Share.findById(shareId);
      if (!share) {
        return res.status(404).json({
          success: false,
          message: 'Lien de partage non trouvé'
        });
      }

      // Vérifier les permissions
      if (share.createdBy.toString() !== req.user.id_user) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
      }

      // Marquer comme inactif
      share.active = false;
      await share.save();

      res.json({
        success: true,
        message: 'Lien de partage révoqué avec succès'
      });

    } catch (error) {
      console.error('Erreur lors de la révocation du lien:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

  /**
   * Valider l'accès avec mot de passe
   */
  async validatePassword(req, res) {
    try {
      const { shareId, password } = req.body;

      const share = await Share.findOne({ shareId }).select('+settings.password');
      if (!share) {
        return res.status(404).json({
          success: false,
          message: 'Lien de partage non trouvé'
        });
      }

      if (!share.isValid()) {
        return res.status(410).json({
          success: false,
          message: 'Ce lien de partage n\'est plus valide'
        });
      }

      if (!share.settings.requirePassword) {
        return res.json({
          success: true,
          valid: true
        });
      }

      const isValid = await bcrypt.compare(password, share.settings.password);
      
      if (isValid) {
        // Incrémenter les vues si le mot de passe est correct
        await share.incrementViews();
      }

      res.json({
        success: true,
        valid: isValid
      });

    } catch (error) {
      console.error('Erreur lors de la validation du mot de passe:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

  /**
   * Obtenir les détails d'un lien de partage
   */
  async getShareDetails(req, res) {
    try {
      const { shareId } = req.params;

      const share = await Share.findOne({ shareId })
        .populate('formulaireId', 'titre description')
        .select('-settings.password');

      if (!share) {
        return res.status(404).json({
          success: false,
          message: 'Lien de partage non trouvé'
        });
      }

      if (!share.isValid()) {
        return res.status(410).json({
          success: false,
          message: 'Ce lien de partage n\'est plus valide'
        });
      }

      res.json({
        success: true,
        data: share
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

  /**
   * Accéder à un formulaire via un lien de partage
   */
  async accessForm(req, res) {
    try {
      const { shareId } = req.params;

      const share = await Share.findOne({ shareId })
        .populate('formulaireId');

      if (!share) {
        return res.status(404).json({
          success: false,
          message: 'Lien de partage non trouvé'
        });
      }

      if (!share.isValid()) {
        return res.status(410).json({
          success: false,
          message: 'Ce lien de partage n\'est plus valide'
        });
      }

      // Incrémenter les vues
      await share.incrementViews();

      res.json({
        success: true,
        data: {
          formulaire: share.formulaireId,
          requirePassword: share.settings.requirePassword,
          shareDetails: {
            id: share._id,
            shareId: share.shareId,
            createdAt: share.createdAt
          }
        }
      });

    } catch (error) {
      console.error('Erreur lors de l\'accès au formulaire:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }

  /**
   * Soumettre une réponse à un formulaire partagé
   */
  async submitResponse(req, res) {
    try {
      const { shareId, responses } = req.body;

      // Vérifier que le partage existe et est valide
      const share = await Share.findOne({ shareId });
      if (!share) {
        return res.status(404).json({
          success: false,
          message: 'Lien de partage non trouvé'
        });
      }

      if (!share.isValid()) {
        return res.status(410).json({
          success: false,
          message: 'Ce lien de partage n\'est plus valide'
        });
      }

      // Récupérer le formulaire
      const formulaire = await Formulaire.findById(share.formulaireId);
      if (!formulaire) {
        return res.status(404).json({
          success: false,
          message: 'Formulaire non trouvé'
        });
      }

      // Générer un ID unique pour cette soumission
      const responseId = require('crypto').randomUUID();

      // Formater les réponses pour le stockage
      const formattedResponses = Object.entries(responses).map(([questionId, response]) => ({
        questionId,
        value: response.value,
        type: response.type
      }));

      // Ajouter la réponse au formulaire
      formulaire.responseTotal = (formulaire.responseTotal || 0) + 1;
      formulaire.responseSondee = formulaire.responseSondee || [];
      formulaire.responseSondee.push({
        sonde: responseId,
        reponse: formattedResponses,
        shareId: shareId,
        submittedAt: new Date()
      });

      await formulaire.save();

      // Mettre à jour les statistiques du partage
      await share.incrementResponses();

      console.log(`Nouvelle réponse soumise pour le formulaire ${formulaire._id} via le partage ${shareId}`);

      res.status(201).json({
        success: true,
        message: 'Réponse soumise avec succès',
        data: {
          responseId,
          submittedAt: new Date()
        }
      });

    } catch (error) {
      console.error('Erreur lors de la soumission de la réponse:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la soumission de la réponse'
      });
    }
  }
}

module.exports = new ShareController();
