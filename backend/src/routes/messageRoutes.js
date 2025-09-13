const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const auth = require("../middleware/auth");

/*
 * POST /api/messages
 * Save a new message and generate AI reply
*/
router.post("/", auth, async (req, res) => {
    try {
        const { text, conversationId } = req.body;
        const userId = req.user.id;

        // If no conversationId, create a new conversation
        let convoId = conversationId;
        if (!convoId) {
            const newConvo = await new Conversation({ userId }).save();
            convoId = newConvo._id.toString();
        }

        // Save user message with conversationId
        const userMessage = new Message({ userId, text, fromAI: false, conversationId: convoId });
        await userMessage.save();

        // Generate AI reply (dummy logic)
        let aiText = "Hi there! I'm Darwin, here to help.";
        const lower = text.toLowerCase();
        if (lower.includes("workout")) aiText = "Try 3 sets of push-ups...";
        if (lower.includes("diet")) aiText = "Include lean proteins...";

        const aiMessage = new Message({ userId, text: aiText, fromAI: true, conversationId: convoId });
        await aiMessage.save();

        // Update conversation updatedAt
        await Conversation.findByIdAndUpdate(convoId, { updatedAt: Date.now() });

        res.json({ userMessage, aiMessage, conversationId: convoId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to send message" });
    }
});

/*
 * GET /api/messages
 * Fetch past messages for a user
*/
router.get("/", auth, async (req, res) => {
    try {
        const messages = await Message.find({ userId: req.user.id }).sort("timestamp");
        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

/*
 * GET /api/messages/:conversationId
 * Fetch messages for a specific conversation
*/
router.get("/:conversationId", auth, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({
            userId: req.user.id,
            conversationId
        }).sort("timestamp");
        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});


module.exports = router;