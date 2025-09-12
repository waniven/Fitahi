import api from "./api";

// GET all workouts for logged-in user
export async function getWorkouts() {
    const res = await api.get("/workouts");
    return res.data;
};

// GET a single workout by id
export async function getWorkoutById(id) {
    const res = await api.get(`/workouts/${id}`);
    return res.data;
};

// POST a new workout
export async function createWorkout(workout) {
    const res = await api.post("/workouts", workout);
    return res.data;
};

// PATCH an existing workout
export async function updateWorkout(id, workout) {
    const res = await api.patch(`/workouts/${id}`, workout);
    return res.data;
};

// DELETE a workout
export async function deleteWorkout(id) {
    await api.delete(`/workouts/${id}`);
};
