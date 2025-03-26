const mongoose = require('mongoose');
const {DateTime} = require('luxon');

const sondeFormulaireSchema = new mongoose.Schema({
    email: { type: String  , default :''},
    password: { type: String , default : ''},
    nomComplet: { type: String },
    form: { type: mongoose.Schema.Types.ObjectId, ref: 'Formulaire' },
    aRepondu: { type: String ,  default :'0' },
    aFiniDeRepondu: { type: String ,  default :'0' },
    responses :   [{ type: mongoose.Schema.Types.ObjectId, ref: 'reponse-form' , default :[]},],
    token: { type: String },
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

module.exports = mongoose.model('Sonde-formulaire', sondeFormulaireSchema);
