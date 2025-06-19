const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true },
    name: { type: String },
    customFields: { type: Map, of: String },
    tags: [{ type: String }],
    status: { type: String, enum: ['active', 'unsubscribed', 'bounced'], default: 'active' },
    lastEmailSent: { type: Date },
    notes: { type: String },
}, { timestamps: true });

// Create a compound index for userId and email to ensure uniqueness per user
recipientSchema.index({ userId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Recipient', recipientSchema); 