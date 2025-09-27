const { Schema, model } = require('mongoose');

// Nutrition schema for the databse
const nutritionSchema = new Schema(
    {
        // owner of nutrition log
        userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },

        // food name
        name: { type: String, required: true },

        // food type (breakfast, lunch, dinner, snack)
        type: { type: String, required: true, lowercase: true },

        // calories
        calories: { type: Number, required: true },

        // protein (grams)
        protein: { type: Number, required: true },

        // fat (grams)
        fat: { type: Number, required: true },

        // carbs (grams)
        carbs: { type: Number, required: true },
    },
    // auto add createdAt and updatedAt
    { timestamps: true }
);

// export nutrition model
module.exports = model('Nutrition', nutritionSchema);