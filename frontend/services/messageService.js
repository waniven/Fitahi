import api, { loginTemp } from "./api";

// POST send a message & get AI response
export async function sendMessage(text) {
    // make sure we have a token
    if (!api.defaults.headers.Authorization) {
        const loggedIn = await loginTemp();
        if (!loggedIn) throw new Error("Unable to login for token");
    }

    const res = await api.post("/messages", { text });
    return res.data; // { userMessage, aiMessage }
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
