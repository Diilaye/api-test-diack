const mongoose = require('mongoose');

const niveauAcademiqueSchema = new mongoose.Schema({
    titre: { type: String, required: true },
    description: { type: String }
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

module.exports = mongoose.model('NiveauAcademique', niveauAcademiqueSchema);
