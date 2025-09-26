// import mongoose for MongoDB schemas
const mongoose = require("mongoose");

// define schema for biometric logs
const biometricSchema = new mongoose.Schema({
    // reference to User model
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    // user height in cm (50–300)
    height: {
        type: Number,
        required: true,
        min: 50,
        max: 300,
    },
    // user weight in kg (10–500)
    weight: {
        type: Number,
        required: true,
        min: 10,
        max: 500,
    },
    // time of log (defaults to now)
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

// virtual field for BMI (weight / height² in meters)
biometricSchema.virtual("bmi").get(function () {
    return this.height && this.weight
        ? (this.weight / Math.pow(this.height / 100, 2)).toFixed(1)
        : null;
});

// export Biometric model
module.exports = mongoose.model("Biometric", biometricSchema);