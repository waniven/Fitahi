const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const auth = require("../middleware/auth");

/*
 * POST /api/conversations
 * Create a new conversation
*/
router.post("/", auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const title = req.body.title || "New Conversation";

        const convo = new Conversation({ userId, title });
        await convo.save();

        res.json(convo);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create conversation" });
    }
});

/*
 * GET /api/conversations
 * Fetch all conversations for a user
*/
router.get("/", auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const convos = await Conversation.find({ userId }).sort({ updatedAt: -1 });
        res.json(convos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch conversations" });
    }
});

module.exports = router;
