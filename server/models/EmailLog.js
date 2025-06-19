const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    companyEmail: {
        type: String,
        required: true
    },
    recipientName: String,
    status: {
        type: String,
        enum: ['sent', 'failed', 'replied', 'interviewed'],
        default: 'sent'
    },
    error: String,
    sentAt: {
        type: Date,
        default: Date.now
    },
    template: {
        subject: String,
        body: String
    },
    attachments: [{
        filename: String,
        path: String
    }],
    customFields: {
        type: Map,
        of: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('EmailLog', emailLogSchema);