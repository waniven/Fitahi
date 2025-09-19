import api from "./api";

/**
 * API for /api/nutrition
 * No ids needed
 * Self-service endpoints that use the session token for id
 */

//create nutrition log (POST)
export async function postNutrition({ name, type, calories, protein, fat, carbs }) {
    const res = await api.post('nutrition', {
        name, 
        type, 
        calories, 
        protein, 
        fat, 
        carbs
    });
    return res.data;
}

//get todays nutrition information
export async function getNutrition() {
    const res = await api.get('nutrition');
    return res.data;
}

//delete nutrition log 
export async function deleteNutrition(id){
    await api.delete(`nutrition/${id}`);
}