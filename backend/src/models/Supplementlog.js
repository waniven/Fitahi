const { Schema, model } = require('mongoose');

// Supplement log schema
const supplementLogSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true }, // Reference to user
        supplement_id: { type: Schema.Types.ObjectId, ref: 'Supplement', required: true }, // Reference to supplement
        status: { type: String, enum: ['taken', 'skipped', 'scheduled'], required: true }, // Log status
        date: { type: String, required: true }, // Log date in YYYY-MM-DD
    },
    { timestamps: true } // Adds createdAt and updatedAt
);

module.exports = model('SupplementLog', supplementLogSchema); // Export model
