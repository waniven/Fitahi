import api from "./api";

// Get all workouts for logged-in user
export const getWorkouts = async () => {
    const res = await api.get("/workouts");
    return res.data;
};

// Get a single workout by id
export const getWorkout = async (id) => {
    const res = await api.get(`/workouts/${id}`);
    return res.data;
};

// Create a new workout
export const createWorkout = async (workoutData) => {
    const res = await api.post("/workouts", workoutData);
    return res.data;
};

// Update an existing workout
export const updateWorkout = async (id, workoutData) => {
    const res = await api.patch(`/workouts/${id}`, workoutData);
    return res.data;
};

// Delete a workout
export const deleteWorkout = async (id) => {
    await api.delete(`/workouts/${id}`);
};
