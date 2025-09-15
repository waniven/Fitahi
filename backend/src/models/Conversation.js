const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
    userId: { type: String, required: true },       // owner of the conversation
    title: { type: String, default: "New Conversation" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },   // update whenever a message is added
});

module.exports = mongoose.model("Conversation", conversationSchema);
