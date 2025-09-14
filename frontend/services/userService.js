import api from "./api";

/**
 * API for /api/user
 * No ids needed
 * Self-service endpoints that use the session token for id
 */

//create user profile (POST)
export async function signup({ firstname, lastname, email, dateofbirth, password }) {
    const res = await api.post('users', {
        firstname,
        lastname,
        email,
        dateofbirth,
        password
    });
    return res.data;
}

//get information about the users own profile
export async function getMe() {
    const res = await api.get('users/me');
    return res.data;
}

//update user profile 
export async function updateMe({ firstname, lastname, email, dateofbirth, password, pfp }) {
    const res = await api.patch('users/me', {
        firstname,
        lastname,
        email,
        dateofbirth,
        ...(password ? { password } : {}),
        ...(pfp ? { pfp } : {}),
    });
    return res.data;
}

//delete user
export async function deleteMe() {
    await api.delete("users/me");
}