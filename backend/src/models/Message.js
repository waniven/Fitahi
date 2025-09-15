const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    conversationId: { type: String, required: true },
    text: { type: String, required: true },
    fromAI: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);
