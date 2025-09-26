const { Schema, model } = require('mongoose');

const supplementSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true }, // owner of supplement
        name: { type: String, required: true },
        dosage: { type: Number, required: true },
        time: { type: String, required: true }, //store as "HH:mm"
        selectedDays: {// days of week workout is performed (valid array, 0–6 integer check, no duplicate days)
            type: [Number],
            required: true,
            validate: {
                validator: (arr) =>
                    Array.isArray(arr) &&
                    new Set(arr).size === arr.length && //no duplicate days
                    arr.every((day) => Number.isInteger(day) && day >= 0 && day <= 6), //valid day numbers
                message: 'selectedDays must be an array of unique integers between 0-6.',
            },
        },
    }, { timestamps: true } //add create and update dates
)

module.exports = model('supplement', supplementSchema); //export model