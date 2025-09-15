import api from "./api";

// POST a new workout result
export async function createWorkoutResult(result) {
    const res = await api.post("/workout-results", result);
    return res.data;
}

// GET all workout results for the user
export async function getWorkoutResults() {
    const res = await api.get("/workout-results");
    return res.data;
}

// GET a single workout result by ID
export async function getWorkoutResultById(id) {
    const res = await api.get(`/workout-results/${id}`);
    return res.data;
}
