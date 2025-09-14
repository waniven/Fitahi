const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const auth = require("../middleware/auth");
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

// init Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

/*
 * POST /api/messages
 * Save a new message and generate AI reply with Gemini
*/
router.post("/", auth, async (req, res) => {
    try {
        const { text, conversationId } = req.body;
        const userId = req.user.id;

        // if no conversationId, create a new one
        let convoId = conversationId;
        if (!convoId) {
            const newConvo = await new Conversation({ userId }).save();
            convoId = newConvo._id.toString();
        }

        // save user message
        const userMessage = new Message({
            userId,
            text,
            fromAI: false,
            conversationId: convoId,
        });
        await userMessage.save();

        // fetch conversation history
        const pastMessages = await Message.find({ conversationId: convoId }).sort(
            "timestamp"
        );
        const chatHistory = pastMessages
            .map((m) => `${m.fromAI ? "AI" : "User"}: ${m.text}`)
            .join("\n");

        // build prompt
        const prompt = `
You are Darwin, a friendly AI assistant specialized in fitness, workouts, and diet advice.
Here is the conversation so far:
${chatHistory}

User: ${text}
AI:
    `;

        // call Gemini API
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        // extract AI text
        const aiText = result.response.text();

        // save AI message
        const aiMessage = new Message({
            userId,
            text: aiText,
            fromAI: true,
            conversationId: convoId,
        });
        await aiMessage.save();

        // update conversation updatedAt
        await Conversation.findByIdAndUpdate(convoId, { updatedAt: Date.now() });

        res.json({ userMessage, aiMessage, conversationId: convoId });
    } catch (err) {
        console.error("❌ Error in /api/messages:", err);
        res.status(500).json({ error: "Failed to send message" });
    }
});

/*
 * GET /api/messages
 * Fetch all messages for a user
*/
router.get("/", auth, async (req, res) => {
    try {
        const messages = await Message.find({ userId: req.user.id }).sort(
            "timestamp"
        );
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
            conversationId,
        }).sort("timestamp");
        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

module.exports = router;