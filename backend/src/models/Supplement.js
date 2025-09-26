const { Schema, model } = require('mongoose');

const supplementSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
        name: { type: String, required: true },
        dosage: { type: Number, required: true },
        time: { type: String, required: true },
        selectedDays: {
            type: [Number],
            required: true,
            validate: {
                validator: (arr) =>
                    Array.isArray(arr) &&
                    new Set(arr).size === arr.length &&
                    arr.every((d) => Number.isInteger(d) && d >= 0 && d <= 6),
                message: 'selectedDays must be unique integers 0–6',
            },
        },
    },
    { timestamps: true }
);

module.exports = model('Supplement', supplementSchema); 
