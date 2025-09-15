const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const Feature = require("../models/Feature");
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

        // create conversation if it doesn't exist
        let convoId = conversationId;
        if (!convoId) {
            const newConvo = await new Conversation({ userId }).save();
            convoId = newConvo._id.toString();
        }

        // save user's message
        const userMessage = new Message({
            userId,
            text,
            fromAI: false,
            conversationId: convoId,
        });
        await userMessage.save();

        // fetch last 4 messages for context
        const pastMessages = await Message.find({ conversationId: convoId })
            .sort({ timestamp: -1 })
            .limit(4)
            .lean();

        const chatHistory = pastMessages
            .reverse()
            .map((m) => `${m.fromAI ? "AI" : "User"}: ${m.text}`)
            .join("\n");

        const isFirstUserMessage = pastMessages.filter(m => !m.fromAI).length === 1;

        // fetch features
        const features = await Feature.find({});
        const featureList = features.map(f => `- ${f.name}: ${f.description}`).join("\n");

        // classification first
        const classificationPrompt = `
You are a classifier.

Task: Decide if the user's message is about one of these Fitahi features or not.

Features:
${featureList}

Rules:
- If the user's message 100% relates to one of these, based on name AND description AND previous messages if applicable, respond with the feature's name exactly (only if the feature exists), otherwise respond with: NO_FEATURE
- If the user is asking about anything else (recipes, motivation, fitness advice, casual talk), respond with: NO_FEATURE

User: "${text}"
`;

        const classificationResult = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: classificationPrompt }] }],
        });

        const classification = classificationResult.response.text().trim();

        let matchedFeature = null;
        if (classification !== "NO_FEATURE") {
            matchedFeature = features.find(f => f.name === classification);
        }

        // then response generation
        let promptText;

        if (matchedFeature && matchedFeature.steps?.length > 0) {
            // feature flow
            promptText = `
You are Darwin, Fitahi's friendly AI assistant.
Fitahi is a fitness app with features to log workouts, diet, supplements, water intake, and biometrics, plus account settings.
Always respond like a casual text message. Emojis are always welcome. Be supportive, motivational and friendly.
${isFirstUserMessage ? "Introduce yourself briefly with who you are." : "Continue the conversation naturally, considering conversation history."}

Conversation history:
${chatHistory}

The user asked: "${text}".
Here are the official steps for "${matchedFeature.name}":
${matchedFeature.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Instructions:
- Keep steps in exact order
- Do not skip or invent steps
- Rewrite naturally like a friendly text message
- Keep numbering intact
- Scatter emojis naturally
- End with encouraging note
Plain text only.
`;
        } else {
            // casual chat flow
            promptText = `
You are Darwin, Fitahi's friendly AI assistant.
Fitahi is a fitness app with features to log workouts, diet, supplements, water intake, and biometrics, plus account settings.
Always respond like a casual text message. Emojis are always welcome. Be supportive, motivational and friendly.
${isFirstUserMessage ? "Introduce yourself briefly with who you are." : "Continue the conversation naturally, considering conversation history."}

The user said: "${text}"
Conversation history:
${chatHistory}

ONLY IF the user was asking about a feature: tell them Fitahi doesn't have that feature yet AND DON'T MAKE UP OR LIE ABOUT ALTERNATIVES. Suggest exploring ONE OF existing features instead: logging/creating workouts, water, nutrition, or supplements. DON'T ELBORATE.

Otherwise follow these instructions:
- This is casual conversation.
- You can chat about fitness in general, give encouragement, or answer questions about workouts, meal suggestions, supplements, or healthy habits.
- If the user is asking about medical advice, tell them you are not a doctor and recommend they see a professional.
- If the user asks for a meal plan, quick recipe, or fitness tip, you may provide it casually.
- If the user asks about something unrelated to fitness, steer them back to fitness.
- Use conversation history to make your replies flow naturally, like a real chat.
- Scatter emojis naturally.
Plain text only.
`;
        }

        // generate AI response
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: promptText }] }],
        });

        const aiText = result.response.text().replace(/\*/g, "");

        // save AI message
        const aiMessage = new Message({
            userId,
            text: aiText,
            fromAI: true,
            conversationId: convoId,
        });
        await aiMessage.save();

        // update conversation timestamp
        await Conversation.findByIdAndUpdate(convoId, { updatedAt: Date.now() });

        res.json({ userMessage, aiMessage, conversationId: convoId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to send message" });
    }
});

/*
 * GET /api/messages
 * Fetch all messages for a user
*/
router.get("/", auth, async (req, res) => {
    try {
        const messages = await Message.find({ userId: req.user.id }).sort("timestamp");
        res.json(messages);
    } catch (err) {
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
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

module.exports = router;