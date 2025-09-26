import api from "./api";

// GET today's logs
export async function getTodaysSupplementLogs() {
    const res = await api.get("/supplementlogs");
    return res.data;
}

// POST new log
export async function createSupplementLog({ supplement_id, status }) {
    const res = await api.post("/supplementlogs", { supplement_id, status });
    return res.data;
}

// PATCH update log
export async function updateSupplementLog({ id, status }) {
    const res = await api.patch(`/supplementlogs/${id}`, { status });
    return res.data;
}
