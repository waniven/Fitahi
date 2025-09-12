import { BASE_URL } from "@env";
import axios from "axios";

const api = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: {
        "Content-Type": "application/json",
    },
});

let token = null;

// login function to get a token for testing (temporary)
export async function loginTemp() {
    try {
        const res = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: "mikey@example.com",
            password: "pass123",
        });

        token = res.data.token;
        console.log("✅ Got token:", token);

        api.defaults.headers.Authorization = `Bearer ${token}`;
        return true;
    } catch (err) {
        console.error("❌ Login failed:", err.response?.data || err.message);
        return false;
    }
}


export default api;
