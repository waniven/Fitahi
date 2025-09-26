import api from "./api";

//GET todays supplementsLogs for the current user
export async function getTodaysSupplementLogs() {
    const res = await api.get("/supplementlogs");
    return res.data;
};

//POST a new supplementLog for the current user
export async function createSupplementLog({ id, status }) {
    const res = await api.post("/supplementlogs", { id, status });
    return res.data;
};

//PATCH an exsisting supplementLog
export async function updateSupplementLog({ id, status }) {
    const res = await api.patch(`/supplementlogs/${id}`, { id, status });
    return res.data;
};
