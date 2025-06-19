const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    isHtml: { type: Boolean, default: true },
    variables: [{ type: String }], // List of variables used in the template
    category: { type: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Template', templateSchema); 