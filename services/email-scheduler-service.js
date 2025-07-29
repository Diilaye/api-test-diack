const cron = require('node-cron');
const ScheduledEmail = require('../models/scheduled-email-model');
const Share = require('../models/share-model');
const nodemailer = require('nodemailer');

class EmailSchedulerService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
    this.startScheduler();
  }

  initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  startScheduler() {
    // Vérifier les emails programmés toutes les minutes
    cron.schedule('* * * * *', async () => {
      await this.processScheduledEmails();
    });

    console.log('Planificateur d\'emails démarré');
  }

  async processScheduledEmails() {
    try {
      const now = new Date();
      
      // Trouver les emails programmés à envoyer
      const scheduledEmails = await ScheduledEmail.find({
        scheduledDate: { $lte: now },
        status: 'pending'
      }).populate('shareId');

      for (const scheduledEmail of scheduledEmails) {
        try {
          await this.sendScheduledEmail(scheduledEmail);
        } catch (error) {
          console.error(`Erreur lors de l'envoi de l'email programmé ${scheduledEmail._id}:`, error);
          await scheduledEmail.markAsFailed(error.message);
        }
      }

      // Traiter les emails récurrents
      await this.processRecurringEmails();

    } catch (error) {
      console.error('Erreur lors du traitement des emails programmés:', error);
    }
  }

  async sendScheduledEmail(scheduledEmail) {
    if (!scheduledEmail.shareId || !scheduledEmail.shareId.isValid()) {
      throw new Error('Lien de partage invalide ou expiré');
    }

    // Construire le contenu de l'email
    let emailContent = `
      <h2>${scheduledEmail.subject}</h2>
      <p>${scheduledEmail.message}</p>
      
      <p>Cliquez sur le lien suivant pour accéder au formulaire :</p>
      <p><a href="${scheduledEmail.shareUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accéder au formulaire</a></p>
      
      <p>Ou copiez et collez ce lien dans votre navigateur :</p>
      <p>${scheduledEmail.shareUrl}</p>
    `;

    if (scheduledEmail.includePassword && scheduledEmail.password) {
      emailContent += `
        <p><strong>Mot de passe requis :</strong> ${scheduledEmail.password}</p>
      `;
    }

    emailContent += `
      <hr>
      <p><small>Ce message a été envoyé automatiquement. Merci de ne pas répondre à cet email.</small></p>
    `;

    // Envoyer l'email à tous les destinataires
    const emailPromises = scheduledEmail.recipients.map(recipient => {
      return this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: recipient,
        subject: scheduledEmail.subject,
        html: emailContent
      });
    });

    await Promise.all(emailPromises);

    // Marquer comme envoyé
    await scheduledEmail.markAsSent(scheduledEmail.recipients.length);

    // Mettre à jour les statistiques du lien de partage
    if (scheduledEmail.shareId) {
      await scheduledEmail.shareId.incrementEmailsSent(scheduledEmail.recipients.length);
    }

    console.log(`Email programmé envoyé avec succès: ${scheduledEmail._id}`);
  }

  async processRecurringEmails() {
    try {
      const now = new Date();
      
      // Trouver les emails récurrents à traiter
      const recurringEmails = await ScheduledEmail.find({
        recurring: true,
        status: 'sent',
        nextScheduledDate: { $lte: now }
      }).populate('shareId');

      for (const scheduledEmail of recurringEmails) {
        try {
          // Créer une nouvelle instance pour l'envoi récurrent
          const newScheduledEmail = new ScheduledEmail({
            formulaireId: scheduledEmail.formulaireId,
            shareId: scheduledEmail.shareId._id,
            createdBy: scheduledEmail.createdBy,
            recipients: scheduledEmail.recipients,
            subject: scheduledEmail.subject,
            message: scheduledEmail.message,
            shareUrl: scheduledEmail.shareUrl,
            password: scheduledEmail.password,
            includePassword: scheduledEmail.includePassword,
            scheduledDate: scheduledEmail.nextScheduledDate,
            recurring: true,
            recurringPattern: scheduledEmail.recurringPattern,
            totalRecipients: scheduledEmail.totalRecipients,
            status: 'pending'
          });

          await newScheduledEmail.save();

          // Calculer la prochaine date pour l'email original
          scheduledEmail.nextScheduledDate = scheduledEmail.calculateNextScheduledDate();
          await scheduledEmail.save();

          console.log(`Email récurrent programmé: ${newScheduledEmail._id}`);

        } catch (error) {
          console.error(`Erreur lors de la création de l'email récurrent pour ${scheduledEmail._id}:`, error);
        }
      }

    } catch (error) {
      console.error('Erreur lors du traitement des emails récurrents:', error);
    }
  }

  async getScheduledEmailsStatus() {
    try {
      const stats = await ScheduledEmail.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      return stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {});

    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {};
    }
  }

  async cancelScheduledEmail(scheduledEmailId) {
    try {
      const scheduledEmail = await ScheduledEmail.findById(scheduledEmailId);
      if (!scheduledEmail) {
        throw new Error('Email programmé non trouvé');
      }

      scheduledEmail.status = 'cancelled';
      await scheduledEmail.save();

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'email programmé:', error);
      return false;
    }
  }

  async retryFailedEmail(scheduledEmailId) {
    try {
      const scheduledEmail = await ScheduledEmail.findById(scheduledEmailId);
      if (!scheduledEmail) {
        throw new Error('Email programmé non trouvé');
      }

      scheduledEmail.status = 'pending';
      scheduledEmail.errorMessage = null;
      scheduledEmail.scheduledDate = new Date();
      await scheduledEmail.save();

      return true;
    } catch (error) {
      console.error('Erreur lors de la reprogrammation de l\'email:', error);
      return false;
    }
  }
}

module.exports = new EmailSchedulerService();
