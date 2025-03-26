const mongoose = require('mongoose');

const champModel = new mongoose.Schema({
    type: {
        type: String,
        enum: [ 'textField',
                'textArea',
                'singleChoice',
                'yesno',
                'multiChoice',
                'nomComplet',
                'email',
                'addresse',
                'telephone',
                'image',
                'file',
                'separator',
                'explication',
                'separator-title'
    ],
        required: true
    },

    nom: { type: String },

    description: { type: String },

    formulaire: { type: mongoose.Schema.Types.ObjectId, ref: 'Formulaire' },

    listeReponses: [{
        type: Map,
    }],

    listeOptions: [{
        type: Map,
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
