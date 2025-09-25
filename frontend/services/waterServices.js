import api from "./api";

/**
 * API for /api/water
 * No ids needed
 * Self-service endpoints that use the session token for id
 */

//create water log (POST)
export async function postWater({ time, amount }) {
    const res = await api.post('water', {
        time,
        amount
    });
    return res.data;
}

//get todays water information
export async function getWater() {
    const res = await api.get('water');
    return res.data;
}

// get all water logs for user
export async function getAllWater() {
    const res = await api.get("water/all");
    return res.data;
}

//delete water log 
export async function deleteWater(id) {
    await api.delete(`water/${id}`);
}