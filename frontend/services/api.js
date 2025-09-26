// Import base URL from environment variables and axios for HTTP requests
import { BASE_URL } from "@env";
import axios from "axios";

// Create an Axios instance with a base URL and default JSON headers
const api = axios.create({
    // All requests will be prefixed with this base URL
    baseURL: `${BASE_URL}/api`,

    // Default content type for requests
    headers: { "Content-Type": "application/json" },
});

// Variable to store the current authentication token
let accessToken = null;

// Function to set or remove the authentication token
export function setAuthToken(token) {
    // Save token locally or null if none provided
    accessToken = token || null;

    if (accessToken) {
        // If a token exists, add it to Axios default headers for all requests
        api.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
        // If no token, remove the Authorization header
        delete api.defaults.headers.Authorization;
    }
}

// Export the Axios instance for making API requests elsewhere in the app
export default api;