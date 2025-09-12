import api from "./api";

// get all workouts for logged-in user
export async function getWorkouts() {
    console.log("👉 Sending headers:", api.defaults.headers);
    const res = await api.get("/workouts");
    return res.data;
};

// get a single workout by id
export async function getWorkoutById(id) {
    const res = await api.get(`/workouts/${id}`);
    return res.data;
};

// create a new workout
export async function createWorkout(workout) {
    const res = await api.post("/workouts", workout);
    return res.data;
};

// update an existing workout
export async function updateWorkout(id, workout) {
    const res = await api.patch(`/workouts/${id}`, workout);
    return res.data;
};

// delete a workout
export async function deleteWorkout(id) {
    await api.delete(`/workouts/${id}`);
};
