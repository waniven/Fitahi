import { BASE_URL } from "@env";
import axios from "axios";

const api = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: { "Content-Type": "application/json" },
});

let accessToken = null;

export function setAuthToken(token) {
    accessToken = token || null;
    
    if (accessToken) {
        api.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.Authorization;
    }
}

export default api;