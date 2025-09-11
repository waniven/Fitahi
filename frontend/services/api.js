import axios from "axios";

const { BASE_URL, BEARER } = process.env;

const api = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: {
        "Content-Type": "application/json",
    },
});

// attach token on each request
api.interceptors.request.use((config) => {
    // temporary token for testing
    config.headers.Authorization = `Bearer ${BEARER}`;
    return config;
});

export default api;
