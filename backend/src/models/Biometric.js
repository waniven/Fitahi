const mongoose = require("mongoose");

const biometricSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    height: {
        type: Number,
        required: true,
        min: 50,
        max: 300,
    },
    weight: {
        type: Number,
        required: true,
        min: 10,
        max: 500,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

// virtual field for BMI
biometricSchema.virtual("bmi").get(function () {
    return this.height && this.weight
        ? (this.weight / Math.pow(this.height / 100, 2)).toFixed(1)
        : null;
});

module.exports = mongoose.model("Biometric", biometricSchema);
