const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// init Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

/* 
 * helper to build user context from profile data 
*/
function buildUserContext(me) {
    if (!me) return "";

    return `
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

/*
 * helper to build workout confirmation prompt
*/
function buildWorkoutConfirmationPrompt(createdWorkout) {
    return `
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
}

/*
 * fallback prompt in case workout creation fails 
 */
const workoutCreationFallbackPrompt = `
You are Darwin, Fitahi's AI assistant.
You were asked to create a workout, but an internal error occurred.
Write a short, friendly apology message explaining that you couldn't create it right now and to try again later.
Use a supportive tone and emoji if appropriate.
`;

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
 * helper to build feature classification prompt
*/
function buildFeatureClassificationPrompt(featureList, text) {
    return `
You are a classifier.

Task: Decide if the user's message is about one of these Fitahi features or not.

Features:
${featureList}

Rules:
- If the user's message 100% relates to one of these, based on name AND description AND previous messages if applicable, respond with the feature's name exactly (only if the feature exists), otherwise respond with: NO_FEATURE
- If the user is asking about anything else (recipes, motivation, fitness advice, casual talk), respond with: NO_FEATURE

User: "${text}"
`;
}

/*
 * helper to build feature explanation prompt
*/
function buildFeatureFlowPrompt(isFirstUserMessage, chatHistory, text, matchedFeature) {
    return `
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
}

/*
 * helper to build casual chat prompt
*/
function buildCasualChatPrompt(isFirstUserMessage, userContext, text, chatHistory) {
    return `
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

/*
 * helper to build inactivity check-in prompt for 10 notifications
*/
function buildInactivityCheckinPrompt(userContext) {
    return `
You are Darwin, Fitahi's friendly AI fitness coach.
Fitahi is a fitness app with features to log workouts, diet, supplements, water intake, and biometrics, plus account settings.

Task: Generate a batch of 10 friendly mobile notifications to check in with the user about their fitness journey.
The user hasn't logged anything in 5+ hours.

You must reply only with a single JSON array, formatted like this:
[
  {
    "title": "Put an emoji or two first, then a short, motivational question.",
    "body": "Encouraging, motivating, friendly message (1-2 sentences). Keep it warm and encouraging! Hint that the user can continue the conversation with you in the app."
  },
  ...
  (10 objects total)
]

Each notification should be unique, casual, encouraging, motivational and supportive. Make the user feel cared for and check in on their well-being.  
If possible, try to make each notification relevant to the user's fitness goals or other information based on their profile (if available).

User information:
${userContext}

If there is no relevant info about the user, keep it related to their well-being or fitness, friendly and motivational.
The title and body should sound natural and fit within a (fun and engaging!) mobile notification.
Do NOT include any explanations or markdown — return pure JSON only.
`;
}

/*
 * helper to build inactivity message prompt
*/
function buildInactivityMessagePrompt(userContext, title, body) {
    return `
You are Darwin, Fitahi's friendly AI fitness coach.
Fitahi is a fitness app with features to log workouts, diet, supplements, water intake, and biometrics, plus account settings.

The user just received a check-in notification from you that said:
"${title}: ${body}"

Use this notification content and the available information about the user to start a conversation warmly. Make it seem like you're continuing from the notification naturally.
Ask them a question similar or the same as the notification title; something like how they're feeling, remind them of a goal, or offer a small, actionable idea related to their fitness journey.
If there is no relevant info about the user, keep it related to their well-being or fitness, friendly and motivational.

User information:
${userContext}

Always return a response formatted like a casual text message. Emojis are always welcome! Be supportive, motivational and friendly.
Plain text only.
`;
}

/**
 * predefined inactivity check-in notifications (in case AI generation fails)
*/
notifications = [
    {
        title: "💪✨ How's your energy today?",
        body: "It's been a little while since your last log—want to check in with a quick workout or meal update?"
    },
    {
        title: "🏋️‍♂️🔥 Ready to crush a goal?",
        body: "You've been doing great! How about logging something small to keep the momentum going?"
    },
    {
        title: "🌟💧 Quick check-in, staying hydrated?",
        body: "Just wondering how your fitness journey is going today. Maybe log a workout or a healthy meal?"
    },
    {
        title: "⚡💯 Stay on track, how's your progress been?",
        body: "It's been a bit since your last activity—want to log a quick win to stay consistent?"
    },
    {
        title: "😊🌿 How are you feeling?",
        body: "Fitness is about small steps! Take a moment to log something healthy today."
    },
    {
        title: "🏃‍♀️💨 How do you feel? Keep up the good work!",
        body: "Even a little progress counts. How about logging a meal or workout now?"
    },
    {
        title: "💡 Did you remember to log something today?",
        body: "Your goals are important! A small log today keeps you on track for tomorrow."
    },
    {
        title: "🔥🏋️ Feeling strong?",
        body: "It's been a few hours since your last activity. Want to log something to celebrate your progress?"
    },
    {
        title: "🌟💖 Wellness check - do you need a little boost?",
        body: "Checking in! How's your fitness journey going? Have a chat with Darwin!"
    },
    {
        title: "💪🏽✨ Keeping your streak alive?",
        body: "Every little log matters. Let's add a quick workout or meal update today!"
    }
];

module.exports = {
    notifications,
    buildInactivityCheckinPrompt,
    buildInactivityMessagePrompt,
    buildCasualChatPrompt,
    buildFeatureFlowPrompt,
    buildFeatureClassificationPrompt,
    workoutCreationFallbackPrompt,
    buildWorkoutConfirmationPrompt,
    buildUserContext,
    isCreateWorkoutRequest,
    generateWorkout,
};