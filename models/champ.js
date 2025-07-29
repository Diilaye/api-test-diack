const mongoose = require('mongoose');

const champModel = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },

    nom: { type: String },

    description: { type: String },

    formulaire: { type: mongoose.Schema.Types.ObjectId, ref: 'Formulaire' },

    listeReponses: [{
        option: String,
        id: String,
        delete: String
    }],

    listeOptions: [{
        option: String,
        id: String,
        delete: String
    }],

    isObligatoire: { type: String, default: '0' },

    haveResponse: { type: String, default: '0' },

    notes: { type: String, default: '0' },


}, {
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        },
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('champs-form', champModel);
