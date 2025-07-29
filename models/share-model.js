const mongoose = require('mongoose');

const shareSchema = new mongoose.Schema({
  formulaireId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'formulaire',
    required: true
  },
  shareId: {
    type: String,
    required: true,
    unique: true
  },
  shareUrl: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'utilisateur',
    required: true
  },
  settings: {
    requirePassword: {
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      select: false // Ne pas inclure dans les requêtes par défaut
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    expiryDate: {
      type: Date,
      default: null
    },
    maxUses: {
      type: Number,
      default: null
    }
  },
  stats: {
    views: {
      type: Number,
      default: 0
    },
    responses: {
      type: Number,
      default: 0
    },
    emailsSent: {
      type: Number,
      default: 0
    },
    lastAccessed: {
      type: Date,
      default: null
    }
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour les recherches
shareSchema.index({ formulaireId: 1, active: 1 });
shareSchema.index({ createdBy: 1 });

// Méthode pour vérifier si le lien est encore valide
shareSchema.methods.isValid = function() {
  if (!this.active) return false;
  
  if (this.settings.expiryDate && new Date() > this.settings.expiryDate) {
    return false;
  }
  
  if (this.settings.maxUses && this.stats.views >= this.settings.maxUses) {
    return false;
  }
  
  return true;
};

// Méthode pour incrémenter les vues
shareSchema.methods.incrementViews = function() {
  this.stats.views += 1;
  this.stats.lastAccessed = new Date();
  return this.save();
};

// Méthode pour incrémenter les réponses
shareSchema.methods.incrementResponses = function() {
  this.stats.responses += 1;
  return this.save();
};

// Méthode pour incrémenter les emails envoyés
shareSchema.methods.incrementEmailsSent = function(count = 1) {
  this.stats.emailsSent += count;
  return this.save();
};

module.exports = mongoose.model('Share', shareSchema);
