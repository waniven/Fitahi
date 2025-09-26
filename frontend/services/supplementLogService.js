import api from "./api";

// helper to normalize date -> YYYY-MM-DD
function toDateString(d = new Date()) {
    return new Date(d).toISOString().slice(0, 10);
}

// GET today's supplement logs for the current user
export async function getTodaysSupplementLogs() {
    const res = await api.get("/supplementlogs");
    return res.data;
}

// POST a new supplement log for the current user
export async function createSupplementLog({ supplement_id, status, date }) {
    const res = await api.post("/supplementlogs", {
        supplement_id,
        status,
        date,
    });
    return res.data; // must include { _id, supplement_id, date, status }
}

// PATCH an existing supplement log
export async function updateSupplementLog(id, { status, date }) {
    const todayStr = toDateString(date || new Date());
    const res = await api.patch(`/supplementlogs/${id}`, {
        status,
        date: todayStr,
    });
    return res.data;
}
