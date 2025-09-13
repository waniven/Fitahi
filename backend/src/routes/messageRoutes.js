const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const auth = require("../middleware/auth");

/*
 * POST /api/messages
 * Save a new message and generate AI reply
*/
router.post("/", auth, async (req, res) => {
    try {
        const { text } = req.body;
        const userId = req.user.id;

        // save user message
        const userMessage = new Message({ userId, text, fromAI: false });
        await userMessage.save();

        // generate AI reply (dummy logic for now)
        let aiText = "Hi there! I'm Darwin, here to help with fitness tips, nutrition advice, or your profile.";
        const lower = text.toLowerCase();
        if (lower.includes("workout") || lower.includes("exercise")) {
            aiText = "Try 3 sets of push-ups, squats, and planks today. Keep hydrated!";
        }
        if (lower.includes("diet") || lower.includes("nutrition")) {
            aiText = "Include lean proteins, whole grains, and plenty of vegetables.";
        }

        const aiMessage = new Message({ userId, text: aiText, fromAI: true });
        await aiMessage.save();

        res.json({ userMessage, aiMessage });
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

module.exports = router;