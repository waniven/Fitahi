// import mongoose for MongoDB schemas
const mongoose = require("mongoose");

// define schema for app features
const featureSchema = new mongoose.Schema({
    // feature name (must be unique)
    name: {
        type: String,
        required: true,
        unique: true, // one feature per name
    },
    // feature description
    description: {
        type: String,
        required: true,
    },
    // step-by-step instructions (array of strings)
    steps: {
        type: [String],
        required: true,
    },
});

// create text index for searching by name or description
featureSchema.index({ name: "text", description: "text" });

// export Feature model
module.exports = mongoose.model("Feature", featureSchema);
