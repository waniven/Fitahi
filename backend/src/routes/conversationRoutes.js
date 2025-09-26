const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const auth = require("../middleware/auth");

/*
 * POST /api/conversations
 * Create a new conversation
*/
router.post("/", auth, async (req, res) => {
    try {
        // get user id from auth middleware
        const userId = req.user.id;

        // use provided title or fallback to default
        const title = req.body.title || "New Conversation";

        // create and save new conversation
        const convo = new Conversation({ userId, title });
        await convo.save();

        // return conversation as json
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
        // get user id from auth middleware
        const userId = req.user.id;

        // find conversations sorted by most recent update
        const convos = await Conversation.find({ userId }).sort({ updatedAt: -1 });

        // return conversations as json
        res.json(convos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch conversations" });
    }
});

/*
 * DELETE /api/conversations/:id
 * Delete a conversation and its messages
*/
router.delete("/:id", auth, async (req, res) => {
    try {
        // get conversation id from route params
        const { id } = req.params;

        // delete all messages for this conversation
        await Message.deleteMany({ conversationId: id, userId: req.user.id });

        // delete the conversation itself
        await Conversation.findOneAndDelete({ _id: id, userId: req.user.id });

        // return success response
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete conversation" });
    }
});

module.exports = router;
