const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const Feature = require("../models/Feature");
const User = require("../models/User");
const Workout = require("../models/Workout");
const auth = require("../middleware/auth");
const aiPrompts = require("../helpers/aiPrompts");
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
        // extract text and conversation id from request
        const { text, conversationId } = req.body;
        // get user id from auth middleware
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

        // fetch user profile with quiz + goals
        const me = await User.findById(userId).lean();

        // build user context string from helper
        const userContext = aiPrompts.buildUserContext(me);

        // fetch last 4 messages for context + chat history remembering
        const pastMessages = await Message.find({ conversationId: convoId })
            .sort({ timestamp: -1 })
            .limit(4)
            .lean();

        // format past messages into chat history string
        const chatHistory = pastMessages
            .reverse()
            .map((m) => `${m.fromAI ? "AI" : "User"}: ${m.text}`)
            .join("\n");

        // detect if user wants a workout created
        const wantsWorkout = await aiPrompts.isCreateWorkoutRequest(text, chatHistory);

        if (wantsWorkout) {
            try {
                // generate workout data from AI with helper for prompt
                const workoutData = await aiPrompts.generateWorkout(userContext, chatHistory, text);

                // create workout for user
                const createdWorkout = await Workout.create({
                    ...workoutData,
                    userId,
                });

                // let AI write its own friendly confirmation by prompting it upon successful creation of workout
                const confirmationPrompt = aiPrompts.buildWorkoutConfirmationPrompt(createdWorkout);

                // generate confirmation message
                const confirmationResult = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: confirmationPrompt }] }],
                });

                // clean AI response
                const aiText = confirmationResult.response.text().replace(/\*/g, "");

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

                // return user + AI messages along with created workout, to be handled by frontend
                return res.json({ userMessage, aiMessage, createdWorkout, conversationId: convoId });
            } catch (err) {
                console.error("Workout generation failed:", err);

                // send fallback message (AI generated apology) from helper
                const fallbackResult = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: aiPrompts.workoutCreationFallbackPrompt }] }],
                });

                // clean fallback response
                const fallbackText = fallbackResult.response.text().replace(/\*/g, "");

                // save fallback AI message
                const fallbackMessage = new Message({
                    userId,
                    text: fallbackText,
                    fromAI: true,
                    conversationId: convoId,
                });
                await fallbackMessage.save();

                // return user message + fallback AI message
                return res.json({ userMessage, aiMessage: fallbackMessage, conversationId: convoId });
            }
        }

        // check if this is the first user message in convo
        const isFirstUserMessage = pastMessages.filter(m => !m.fromAI).length === 1;

        // fetch features from db
        const features = await Feature.find({});
        const featureList = features.map(f => `- ${f.name}: ${f.description}`).join("\n");

        // build classification prompt (first)
        const classificationPrompt = aiPrompts.buildFeatureClassificationPrompt(featureList, text);

        // run classification
        const classificationResult = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: classificationPrompt }] }],
        });

        // extract classification result
        const classification = classificationResult.response.text().trim();

        // match feature if one exists
        let matchedFeature = null;
        if (classification !== "NO_FEATURE") {
            matchedFeature = features.find(f => f.name === classification);
        }

        // build response prompt (second)
        let promptText;

        if (matchedFeature && matchedFeature.steps?.length > 0) {
            // feature flow
            promptText = aiPrompts.buildFeatureFlowPrompt(
                isFirstUserMessage,
                chatHistory,
                text,
                matchedFeature
            );
        } else {
            // casual chat flow
            promptText = aiPrompts.buildCasualChatPrompt(
                isFirstUserMessage,
                userContext,
                text,
                chatHistory
            );
        }

        // generate AI response
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: promptText }] }],
        });

        // clean AI response
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

        // return user + AI messages
        res.json({ userMessage, aiMessage, conversationId: convoId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to send message" });
    }
});

/*
 * GET /api/messages/inactivity-checkin
 * Generates a batch of 10 supportive motivational messages + questions
 * Used to trigger scheduled inactivity notifications
 */
router.get("/inactivity-checkin", auth, async (req, res) => {
    try {
        // get user id from auth middleware
        const userId = req.user.id;

        // fetch user profile with quiz + goals
        const me = await User.findById(userId).lean();

        // build user context string from helper
        const userContext = aiPrompts.buildUserContext(me);

        // create AI check-in prompt for 10 notifications
        const prompt = aiPrompts.buildInactivityCheckinPrompt(userContext);

        // generate AI notification content
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        // parse response as JSON
        const raw = result.response.text();
        let notifications;
        try {
            notifications = JSON.parse(raw); // expecting an array of { title, body } objects
            if (!Array.isArray(notifications)) throw new Error("Not an array");
        } catch (e) {
            // 10 generic fall-back notifications if parsing fails
            notifications = aiPrompts.notifications;
        }

        // return batch of notifications
        res.json({ notifications });
    } catch (err) {
        console.error("Failed to send inactivity check-in notifications: ", err);
    }
});

/*
 * POST /api/messages/inactivity-start
 * Starts or continues the dedicated inactivity conversation with the AI
 */
router.post("/inactivity-start", auth, async (req, res) => {
    try {
        const { title, body } = req.body;
        const userId = req.user.id;

        // look for existing inactivity conversation
        let convo = await Conversation.findOne({ userId, type: "inactivity" });
        if (!convo) {
            convo = await new Conversation({ userId, type: "inactivity" }).save();
        }

        // parse conversation id
        const convoId = convo._id.toString();

        // fetch user profile with quiz + goals
        const me = await User.findById(userId).lean();

        // build user context string from helper
        const userContext = aiPrompts.buildUserContext(me);

        // create AI check-in message text
        const starterPrompt = aiPrompts.buildInactivityMessagePrompt(userContext, title, body);

        // generate AI response message
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: starterPrompt }] }],
        });

        // clean AI response
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

        // return AI message + conversation id
        res.json({ aiMessage, conversationId: convoId });
    } catch (err) {
        console.error("Failed to start inactivity conversation: ", err);
    }
});

/*
 * GET /api/messages
 * Fetch all messages for a user
*/
router.get("/", auth, async (req, res) => {
    try {
        // find messages for user sorted by timestamp
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
        // extract conversation id from params
        const { conversationId } = req.params;

        // find messages for this conversation
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
