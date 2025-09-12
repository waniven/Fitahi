import api from "./api";

/**
 * API for /api/user
 * No ids needed
 * Self-service endpoints that use the session token for id
 */

//get information about the users own profile
export async function getMe() {
    const res = await api.get('/users/me');
    return res.data;
}

//update user profile 
export async function updateMe(patch) {
    const res = await api.patch('/users/me', patch);
    return res.data;
}

//delete user
export async function deleteMe() {
    await api.delete("/users/me");
}