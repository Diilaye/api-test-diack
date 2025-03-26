const mongoose = require('mongoose');

const anneeAcademiqueSchema = new mongoose.Schema({
    titre: { type: String, required: true },
    debut: { type: Date, required: true },
    fin: { type: Date, required: true }
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

module.exports = mongoose.model('AnneeAcademique', anneeAcademiqueSchema);
