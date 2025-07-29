const mongoose = require('mongoose');

const scheduledEmailSchema = new mongoose.Schema({
  formulaireId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'formulaire',
    required: true
  },
  shareId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Share',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'utilisateur',
    required: true
  },
  recipients: [{
    type: String,
    required: true
  }],
  subject: {
    type: String,
    default: 'Invitation à remplir un formulaire'
  },
  message: {
    type: String,
    default: 'Vous êtes invité(e) à remplir ce formulaire.'
  },
  shareUrl: {
    type: String,
    required: true
  },
  password: {
    type: String,
    select: false
  },
  includePassword: {
    type: Boolean,
    default: false
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  recurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: null
  },
  nextScheduledDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'cancelled'],
    default: 'pending'
  },
  sentAt: {
    type: Date,
    default: null
  },
  errorMessage: {
    type: String,
    default: null
  },
  emailsSent: {
    type: Number,
    default: 0
  },
  totalRecipients: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index pour les recherches
scheduledEmailSchema.index({ formulaireId: 1, status: 1 });
scheduledEmailSchema.index({ scheduledDate: 1, status: 1 });
scheduledEmailSchema.index({ createdBy: 1 });

// Méthode pour calculer la prochaine date d'envoi récurrent
scheduledEmailSchema.methods.calculateNextScheduledDate = function() {
  if (!this.recurring || !this.recurringPattern) return null;
  
  const baseDate = this.scheduledDate;
  let nextDate = new Date(baseDate);
  
  switch (this.recurringPattern) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
  }
  
  return nextDate;
};

// Méthode pour marquer comme envoyé
scheduledEmailSchema.methods.markAsSent = function(emailsSent = 0) {
  this.status = 'sent';
  this.sentAt = new Date();
  this.emailsSent = emailsSent;
  
  if (this.recurring) {
    this.nextScheduledDate = this.calculateNextScheduledDate();
  }
  
  return this.save();
};

// Méthode pour marquer comme échoué
scheduledEmailSchema.methods.markAsFailed = function(errorMessage) {
  this.status = 'failed';
  this.errorMessage = errorMessage;
  return this.save();
};

module.exports = mongoose.model('ScheduledEmail', scheduledEmailSchema);
