const { Schema, model } = require ('mongoose');

//Nutrition schema for the databse
const nutritionSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true }, //owner of nutrition log
        name: { type: String, required: true },
        type: { type: String, required: true, lowercase: true },
        calories: { type: Number, required: true },
        protein: { type: Number, required: true },
        fat: { type: Number, required: true },
        carbs: { type: Number, required: true },
    },
    { timestamps: true } 
)

//add document to nutrition collection
module.exports = model('Nutrition', nutritionSchema);