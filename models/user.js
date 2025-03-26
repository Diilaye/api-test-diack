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
}, {
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
            delete ret.__v;
        },
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
