// import mongoose for MongoDB schemas
const mongoose = require("mongoose");

// define schema for conversations
const conversationSchema = new mongoose.Schema({
    // owner of the conversation (user id)
    userId: { type: String, required: true },

    // conversation title (defaults to "New Conversation")
    title: { type: String, default: "New Conversation" },

    // creation date (defaults to now)
    createdAt: { type: Date, default: Date.now },

    // last updated date (defaults to now, update when messages are added)
    updatedAt: { type: Date, default: Date.now },
});

// export Conversation model
module.exports = mongoose.model("Conversation", conversationSchema);
