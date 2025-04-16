const mongoose = require('mongoose');

const FabriqueSchemas = new mongoose.Schema({
    nom: { type: String, required: true },
    contact: { type: String },
    pays: { type: String },
    region: { type: String },
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

module.exports = mongoose.model('Fabrique', FabriqueSchemas);
