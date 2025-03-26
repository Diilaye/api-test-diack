const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const FileModel = new Schema({

    url: {
        type: String,
    },

    type: {
        type: String,
    },

    
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    date: {
        type: Date,
        default: Date.now()
    }
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

module.exports = mongoose.model('media', FileModel);