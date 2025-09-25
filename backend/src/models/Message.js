// import mongoose for MongoDB schemas
const mongoose = require("mongoose");

// define schema for chat messages
const messageSchema = new mongoose.Schema({
    // user who sent the message
    userId: { type: String, required: true },

    // linked conversation   
    conversationId: { type: String, required: true },

    // message content
    text: { type: String, required: true },

    // flag if message came from AI        
    fromAI: { type: Boolean, default: false },

    // time message was created
    timestamp: { type: Date, default: Date.now },
});

// export Message model
module.exports = mongoose.model("Message", messageSchema);
