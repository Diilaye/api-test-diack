const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['admin', 'agent', 'etudiant', 'entreprise', 'employe','sondeur'],
        default: 'entreprise',
        required: true
    },
    nom: { type: String, required: true },
    password: { type: String },
    prenom: { type: String },
    adresse: { type: String },
    fonction: { type: String },
    email: { type: String, required: true },
    telephone: { type: String },
    profil: { type: Map, default: {} },
    isProfileComplete: { type: String, default: '0' },
    token: { type: String },
    
    // Nouveaux champs pour la gestion des mots de passe
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    isPasswordSet: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    accountStatus: { 
        type: String, 
        enum: ['active', 'inactive', 'suspended'], 
        default: 'active' 
    },
}, {
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
            delete ret.passwordResetToken;
            delete ret.__v;
        },
    },
}, {
    timestamps: true
});

// Index pour les recherches par email et token de réinitialisation
userSchema.index({ email: 1 });
userSchema.index({ passwordResetToken: 1 });
userSchema.index({ passwordResetExpires: 1 });

module.exports = mongoose.model('User', userSchema);
