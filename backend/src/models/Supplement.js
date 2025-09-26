const { Schema, model } = require('mongoose');

// Supplement schema
const supplementSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true }, // Reference to user
        name: { type: String, required: true }, // Supplement name
        dosage: { type: Number, required: true }, // Dosage amount
        time: { type: String, required: true }, // Time of day to take
        selectedDays: {
            type: [Number], // Days to take (0=Mon, 6=Sun)
            required: true,
            validate: {
                validator: (arr) =>
                    Array.isArray(arr) &&
                    new Set(arr).size === arr.length && // Unique values
                    arr.every((d) => Number.isInteger(d) && d >= 0 && d <= 6), // Valid day indices
                message: 'selectedDays must be unique integers 0–6',
            },
        },
    },
    { timestamps: true } // Adds createdAt and updatedAt
);

module.exports = model('Supplement', supplementSchema); // Export model
