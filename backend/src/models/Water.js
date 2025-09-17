const { Schema, model } = require ('mongoose');

//water schema for the databse
const waterSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true }, //owner of water log
        time: { type: Date, default: Date.now, required: true },
        ammount: { type: Number, required: true }
    },
    { timestamps: true } 
)

//add document to water collection
module.exports = model('Water', waterSchema);