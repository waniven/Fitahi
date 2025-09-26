const { Schema, model } = require('mongoose');

const supplementLogSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
        supplement_id: { type: Schema.Types.ObjectId, ref: 'Supplement', required: true },
        status: { type: String, enum: ['taken', 'skipped', 'scheduled'], required: true },
    },
    { timestamps: true }
);

module.exports = model('SupplementLog', supplementLogSchema);
