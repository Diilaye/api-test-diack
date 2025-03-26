const mongoose = require('mongoose');
const {DateTime} = require('luxon');

const folderModel = new mongoose.Schema({
    titre: { type: String },
    color: { type: String },
    form: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Formulaire' , default : [] }],
    userCreate: { type: mongoose.Schema.Types.ObjectId, ref: 'User'  },
    createdAt: {
        type: Date,
        default: Date.now
    },
    token: { type: String , default : '' },
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

module.exports = mongoose.model('folder-form', folderModel);


