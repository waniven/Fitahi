// 1. Message History and Storage
// Frontend stores messages briefly in state:
// const [messages, setMessages] = useState([]);

// Message structure:
// {
//   id: "unique_timestamp_or_uuid",
//   text: "Message content",
//   fromAI: true/false // true = AI message, false = user
// }

// Backend to do:
// - Persist messages for each user with fields: userId (string), text (string), fromAI (boolean), timestamp (DateTime)
// - Endpoints:
//   - POST /messages (body: { userId, text, fromAI }) --> save new message
//   - GET /messages/:userId --> fetch past messages for History modal

// 2. AI Fitness Tips / Questions
// Frontend currently uses local AI logic (AILocal.jsx):

/* export async function AILocal(prompt) {
  const text = prompt.toLowerCase();
  if (text.includes("workout") || text.includes("exercise")) {
    return "Try 3 sets of push-ups, squats, and planks today. Keep hydrated!";
  }
  if (text.includes("diet") || text.includes("nutrition")) {
    return "Include lean proteins, whole grains, and plenty of vegetables.";
  }
  // ...other responses
  return "I'm here to help with fitness tips, nutrition advice, your profile, or the app. Can you clarify your question?";
} */

// Backend can replace this local logic with an external AI API
// Keep nutrition, fitness tips, and app guidance logic (profile help, etc.)

// 3. Chatbox Integration
// Frontend renders messages like this:
// <FlatList
//   data={messages}
//   keyExtractor={(item) => item.id}
//   renderItem={({ item }) => (
//     <View style={{
//       alignSelf: item.fromAI ? "flex-start" : "flex-end",
//       backgroundColor: item.fromAI ? theme.tint : theme.backgroundAlt
//     }}>
//       <Text>{item.text}</Text>
//     </View>
//   )}
// />
// Backend should maintain `fromAI` field and return messages accordingly

// 4. User Session
// - Track messages via userId
// - Chats are tied to userId so the History modal shows the correct conversation per user

// 5. Frontend & Backend Workflow
// 1. User types a message -> sendMessage() in AIChatbox.jsx
// 2. Frontend sends POST /messages to save user chat
// 3. Backend returns AI response -> save in messages table
// 4. Frontend appends AI response to message list
// 5. User opens History modal -> fetch past messages for that user
