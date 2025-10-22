import api from "./api";

// POST send a message & get AI response
export async function sendMessage(text, conversationId) {
    const res = await api.post("/messages", { text, conversationId });
    return res.data; // { userMessage, aiMessage, conversationId }
}

// GET fetch past messages
export async function getMessages() {
    const res = await api.get("/messages");
    return res.data;
}

// GET fetch all conversations
export async function getConversations() {
    const res = await api.get("/conversations");
    return res.data; // array of conversations
}

// POST create a new conversation
export async function createConversation(title) {
    const res = await api.post("/conversations", { title });
    return res.data; // new conversation
}

// GET fetch messages for a conversation
export async function getMessagesByConversation(conversationId) {
    const res = await api.get(`/messages/${conversationId}`);
    return res.data;
}

// DELETE a conversation and its messages
export async function deleteConversation(conversationId) {
    const res = await api.delete(`/conversations/${conversationId}`);
    return res.data;
}

// GET motivational notification content (title + body)
export async function getInactivityNotification() {
    const res = await api.get("/messages/inactivity-checkin");
    return res.data.notification;
}

// POST or continue the inactivity conversation with AI
export async function startInactivityConversation(title, body) {
    const res = await api.post("/messages/inactivity-start", { title, body });
    return res.data;
}