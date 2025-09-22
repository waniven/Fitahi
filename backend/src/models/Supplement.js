const { Schema, model } = require('mongoose');

const supplement = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true }, // owner of supplement
        name: { type: String, required: true },
        dosage: { type: Number, required: true },
        timeOfDay: { type: Date, requirted: true },
        selectedDays: {// days of week workout is performed (valid array, 0–6 integer check, no duplicate days)
            type: [Number],
            required: true,
            validate: {
                validator: (arr) =>
                    Array.isArray(arr) &&
                    new Set(arr).size === arr.length && //no duplicate days
                    arr.every((day) => Number.isInteger(day) && day >= 0 && day <= 6), //valid day numbers
                message: 'selectedDays must be an array of unique integers between 0–6.',
            },
        },
    }
)

module.exports = model('supplement', supplement); //export model