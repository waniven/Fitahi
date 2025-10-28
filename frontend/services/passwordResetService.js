import api from "./api";

export async function sendResetEmail(email) {
    const res = await api.post("/reset", { email });
}

export async function resetPassword(code, password) {
    return api.post("/reset/password", { code, password });
}