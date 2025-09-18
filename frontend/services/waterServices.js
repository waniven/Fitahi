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

//update water log (PATCH)
export async function updateWater({ id, time, amount }) {
    const res = await api.patch(`water/${id}`, {
        time,
        amount,
    });
    return res.data;
}

//delete water log 
export async function deleteWater(id){
    await api.delete(`water/${id}`);
}