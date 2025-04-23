const mongoose = require('mongoose');

const reponseModel = new mongoose.Schema({
    

    champ: { type: mongoose.Schema.Types.ObjectId, ref: 'champs-form' },

    responseID: { type: String, unique: true },

    responseEtat: { type: String, default: 'public' },

    listeReponses: [{type : mongoose.Schema.Types.Map , default : [
        {
            "id" :"restant"
        }
    ]}],



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

module.exports = mongoose.model('reponse-form', reponseModel);
