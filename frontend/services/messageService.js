import api, { loginTemp } from "./api";

// POST send a message & get AI response
export async function sendMessage(text, conversationId) {
    if (!api.defaults.headers.Authorization) await loginTemp();
    const res = await api.post("/messages", { text, conversationId });
    return res.data; // { userMessage, aiMessage, conversationId }
}

// GET fetch past messages
export async function getMessages() {
    if (!api.defaults.headers.Authorization) {
        const loggedIn = await loginTemp();
        if (!loggedIn) throw new Error("Unable to login for token");
    }

    const res = await api.get("/messages");
    return res.data;
}

// GET fetch all conversations
export async function getConversations() {
    if (!api.defaults.headers.Authorization) await loginTemp();
    const res = await api.get("/conversations");
    return res.data; // array of conversations
}

// POST create a new conversation
export async function createConversation(title) {
    if (!api.defaults.headers.Authorization) await loginTemp();
    const res = await api.post("/conversations", { title });
    return res.data; // new conversation
}

// GET fetch messages for a conversation
export async function getMessagesByConversation(conversationId) {
    if (!api.defaults.headers.Authorization) await loginTemp();
    const res = await api.get(`/messages/${conversationId}`);
    return res.data;
}

// DELETE a conversation and its messages
export async function deleteConversation(conversationId) {
    if (!api.defaults.headers.Authorization) await loginTemp();
    const res = await api.delete(`/conversations/${conversationId}`);
    return res.data;
}
