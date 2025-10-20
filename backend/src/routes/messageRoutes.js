const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const Feature = require("../models/Feature");
const User = require("../models/User");
const Workout = require("../models/Workout");
const auth = require("../middleware/auth");
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

// init Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

/*
 * helper to detect if user explicitly wants a workout created
 */
async function isCreateWorkoutRequest(text, chatHistory) {
    const detectionPrompt = `
You are a classifier.

Determine if the user is explicitly asking for you to CREATE a workout plan for them (not just chat about workouts or exercises).

Examples of CREATE requests:
- "Make me a workout"
- "Create a workout for me"
- "Can you generate me a workout?"
- "Give me a workout for. . ."

Examples that are NOT CREATE requests:
- "What's a good workout for legs?"
- "How many days should I train?"
- "Tell me about strength workouts"
- "Give me a plan to follow for workouts"
- "Walk me through a workout routine"

Rules:
- ONLY respond with one word: CREATE or NO
- Respond with CREATE ONLY if the user is clearly, explicitly, 100% asking you to create/generate/make (NOT update/delete/alter/modify/edit or anything similar, in this case reply with NO) a workout for them that will be saved.
- If the user is just asking questions, seeking advice (e.g. asking you to give them a workout plan to follow), or talking about workouts in general, respond with NO.

Conversation history:
${chatHistory}

User: "${text}"
`;
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: detectionPrompt }] }],
    });

    const response = result.response.text().trim().toUpperCase();
    return response === "CREATE";
}

/*
 * helper to generate structured workout data
 */
async function generateWorkout(userContext, chatHistory, text) {
    const generationPrompt = `
You are Darwin, Fitahi's friendly AI fitness coach.

Task: Create a personalised workout strictly in JSON format that will be saved to the app's Workout Log for the user.

Context:
${userContext}

Conversation history:
${chatHistory}

User request: "${text}"

Rules:
- Always return valid JSON ONLY (no markdown, no explanations).
- Include fields: workoutName, workoutType ("cardio" | "strength" | "hypertrophy"), selectedDays (array of integers, range of 0-6, representing Monday-Sunday, select an appropriate number of days), exercises (array).
- Each exercise MUST have: exerciseName, numOfSets, numOfReps,
exerciseDuration (seconds, optional but include where appropriate, for timed exercises like planks for example), exerciseWeight (kilograms, optional but include where appropriate, for strength exercises for example), restTime.
- Generate at least 4 exercises.
- You MUST tailor intensity and exercise type to the user IF profile info is available.
- If profile info is missing, make a general beginner-friendly full-body plan.
- If the user has specific preferences mentioned in the conversation, incorporate them.

Your response MUST strictly match this JSON structure (again, add in exerciseDuration and exerciseWeight ONLY where appropriate):
{
  "workoutName": "string",
  "workoutType": "cardio" | "strength" | "hypertrophy",
  "selectedDays": [array of unique integers selected, range of 0-6],
  "exercises": [
    {
      "exerciseName": "string",
      "numOfSets": number (must be at least 1),
      "numOfReps": number (must be at least 1),
      "exerciseDuration": number (optional, default 0),
      "exerciseWeight": number (optional, default 0),
      "restTime": number
    }
  ]
}
`;

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: generationPrompt }] }],
    });

    // clean and parse JSON response
    const raw = result.response.text().trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid workout JSON output");
    return JSON.parse(jsonMatch[0]);
}

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

        // build user context string
        let userContext = "";
        if (me) {
            userContext = `
User profile context:
- Fitness Goal: ${me.quiz?.FitnessGoal || "Not set"}
- Fitness Level: ${me.quiz?.FitnessLevel || "Not set"}
- Training Days (per week): ${me.quiz?.TrainingDays || "Not set"}
- Training Time (per session): ${me.quiz?.TrainingTime || "Not set"}
- Dietary preference: ${me.quiz?.Diet || "Not set"}
- Height (cm): ${me.quiz?.Height || "Not set"}
- Weight (kg): ${me.quiz?.Weight || "Not set"}
- Daily Water Goal (mL): ${me.intakeGoals?.dailyWater || "Not set"}
- Daily Calories Goal (kcal): ${me.intakeGoals?.dailyCalories || "Not set"}

ALWAYS keep this context in mind when chatting or giving suggestions, do not make up things about the user that aren't true.
`;
        }

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
        const wantsWorkout = await isCreateWorkoutRequest(text, chatHistory);

        if (wantsWorkout) {
            try {
                const workoutData = await generateWorkout(userContext, chatHistory, text);

                // create workout for user
                const createdWorkout = await Workout.create({
                    ...workoutData,
                    userId,
                });

                // let AI write its own friendly confirmation
                const confirmationPrompt = `
You are Darwin, Fitahi's friendly AI fitness coach.
The user has just asked you to create a workout, and you've successfully done so.

Workout details:
${JSON.stringify(createdWorkout, null, 2)}

Rules:
- Write a short, natural chat reply (no JSON, no lists, no markdown).
- Mention weekdays per week you selected (not actual numbers, mention the actual weekdays: 0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday, 4=Friday, 5=Saturday, 6=Sunday).
- Reply in a supportive, casual and fun tone. The reply is emoji-friendly.
- Mention the workout name, type and a brief description of included exercises, how the workout was tailored, or what it will help the user achieve.
- Hint that the user can view or edit the workout in the Workout Log page (accessible from the Home Page).
- Keep in mind that you are ONLY able to generate new workouts, NOT edit NOR delete existing ones for the user.
`;
                const confirmationResult = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: confirmationPrompt }] }],
                });

                const aiText = confirmationResult.response.text().replace(/\*/g, "");

                // save AI message
                const aiMessage = new Message({
                    userId,
                    text: aiText,
                    fromAI: true,
                    conversationId: convoId,
                });
                await aiMessage.save();

                await Conversation.findByIdAndUpdate(convoId, { updatedAt: Date.now() });
                return res.json({ userMessage, aiMessage, conversationId: convoId });
            } catch (err) {
                console.error("Workout generation failed:", err);

                // fallback message (AI generated apology)
                const fallbackPrompt = `
You are Darwin, Fitahi's AI assistant.
You were asked to create a workout, but an internal error occurred.
Write a short, friendly apology message explaining that you couldn't create it right now and to try again later.
Use a supportive tone and emoji if appropriate.
`;

                const fallbackResult = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: fallbackPrompt }] }],
                });

                const fallbackText = fallbackResult.response.text().replace(/\*/g, "");

                const fallbackMessage = new Message({
                    userId,
                    text: fallbackText,
                    fromAI: true,
                    conversationId: convoId,
                });
                await fallbackMessage.save();

                return res.json({ userMessage, aiMessage: fallbackMessage, conversationId: convoId });
            }
        }

        // check if this is the first user message in convo
        const isFirstUserMessage = pastMessages.filter(m => !m.fromAI).length === 1;

        // fetch features from db
        const features = await Feature.find({});
        const featureList = features.map(f => `- ${f.name}: ${f.description}`).join("\n");

        // build classification prompt (first)
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
            promptText = `
You are Darwin, Fitahi's friendly AI assistant.
Fitahi is a fitness app with features to log workouts, diet, supplements, water intake, and biometrics, plus account settings.
Always respond like a casual text message. Emojis are always welcome. Be supportive, motivational and friendly.
${isFirstUserMessage ? "Introduce yourself briefly with who you are." : "No need to say hello, continue the conversation naturally, considering conversation history."}

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
${isFirstUserMessage ? "Introduce yourself briefly with who you are." : "No need to say hello, continue the conversation naturally, considering conversation history."}

${userContext}
Always briefly let the user know what you've considered from their profile while you're suggesting and/or chatting to them, still keeping things conversational and text-message styled.

The user said: "${text}"
Conversation history:
${chatHistory}

ONLY IF the user was asking about a feature: tell them Fitahi doesn't have that feature yet AND DON'T MAKE UP OR LIE ABOUT ALTERNATIVES. Suggest exploring ONE OF existing features instead: logging/creating workouts, water, nutrition, or supplements. DON'T ELBORATE.
If the user was asking about being able to update their height and/or weight in settings, tell them they are read-only in settings (viewable in settings) and suggest that they make a biometric log to update those fields.

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
