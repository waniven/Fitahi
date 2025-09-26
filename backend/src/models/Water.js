const { Schema, model } = require('mongoose');

// water schema for the databse
const waterSchema = new Schema(
    {
        // owner of water log
        userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },

        // time of water intake
        time: { type: Date, default: Date.now, required: true },

        // amount of water
        amount: { type: Number, required: true }
    },
    // auto add createdAt and updatedAt
    { timestamps: true }
);

// export water model
module.exports = model('Water', waterSchema);