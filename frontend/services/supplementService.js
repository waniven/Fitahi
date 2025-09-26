import api from "./api";

//helper
function to24h(s) {
    if (!s) return s;
    const m = String(s).match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);

    if (m) {
        let h = parseInt(m[1], 10);
        const mm = m[2];
        const ap = m[3].toUpperCase();
        if (ap === "PM" && h < 12) h += 12;
        if (ap === "AM" && h === 12) h = 0;
        return `${String(h).padStart(2, "0")}:${mm}`;
    }
    //already "HH:mm"
    return s;
}

const toServer = (c = {}) => {
    const { timeOfDay, dosage, ...rest } = c;
    return {
        ...rest,
        time: to24h(timeOfDay ?? c.time),
        dosage: dosage != null ? Number(dosage) : undefined,
    };
};

const toClient = (s = {}) => ({
    ...s,
    // keep UI using timeOfDay string; backend sends `time`
    timeOfDay: s.time ?? s.timeOfDay ?? null,
});

//GET all supplements for the current user
export async function getSupplements() {
    const res = await api.get("/supplements");
    const data = res.data;
    return Array.isArray(data) ? data.map(toClient) : [];
};

//POST a new supplement for the current user
export async function createSupplement(supplement) {
    const res = await api.post("/supplements", toServer(supplement));
    return res.data;
};

//PATCH an exsisting supplement
export async function updateSupplement(id, supplement) {
    const res = await api.patch(`/supplements/${id}`, toServer(supplement));
    return res.data;
};

//DELETE an exsisting suppliment
export async function deleteSupplement(id) {
    const res = await api.delete(`/supplements/${id}`);
}
