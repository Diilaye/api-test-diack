const mongoose = require('mongoose');
const {DateTime} = require('luxon');
const { response } = require('express');

const formulaireSchema = new mongoose.Schema({
    titre: { type: String },
    description: { type: String },
    date: {
        type: Date,
        default: DateTime.now()
    },
    champs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'champs-form' ,

        default :[]}

    ],

    logo: { type: mongoose.Schema.Types.ObjectId, ref: 'media' , default : null },

    cover: { type: mongoose.Schema.Types.ObjectId, ref: 'media' , default : null },



    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    folderForm: { type: mongoose.Schema.Types.ObjectId, ref: 'folder-form'  , default : null},

    responseTotal: { type: Number , default : 0 },

    response : [{ type: mongoose.Schema.Types.ObjectId, ref: 'response-formulaire' , default : null}],
    
    responseSondee : [{ type: mongoose.Schema.Types.Map , default : null}],

    createdAt: {
        type: Date,
        default: Date.now
    },
    archived: { type: String , default : '0' },

    deleted: { type: String , default : '0' },
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

module.exports = mongoose.model('Formulaire', formulaireSchema);
