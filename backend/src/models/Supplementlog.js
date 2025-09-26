const { Schema, model } = require('mongoose');

const supplimentLogSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true }, // owner of supplement log 
        supplement_id: { type: Schema.Types.ObjectId, ref:'Supplement', required: true }, //reference to suppliment
        status: { type: String, trim: true, enum: ['taken', 'skipped', 'scheduled'] },
    }, { timestamps: true } //add create and update dates
);

//export
module.exports = model('SupplementLog', supplimentLogSchema);