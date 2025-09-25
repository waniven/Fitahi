import api from "./api";

// GET all reminders for logged-in user
export async function getReminders() {
    const res = await api.get("/reminders");
    return res.data;
};

// GET a single reminder by id
export async function getReminderById(id) {
    const res = await api.get(`/reminders/${id}`);
    return res.data;
};

// POST a new reminder
export async function createReminder(reminder) {
    const res = await api.post("/reminders", reminder);
    return res.data;
};

// PATCH an existing reminder
export async function updateReminder(id, reminder) {
    const res = await api.patch(`/reminders/${id}`, reminder);
    return res.data;
};

// DELETE a reminder
export async function deleteReminder(id) {
    await api.delete(`/reminders/${id}`);
};
