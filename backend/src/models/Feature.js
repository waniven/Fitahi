const mongoose = require("mongoose");

const featureSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, // one feature per name
    },
    description: {
        type: String,
        required: true,
    },
    steps: {
        type: [String], // array of step instructions
        required: true,
    },
});

// text index for search
featureSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Feature", featureSchema);
