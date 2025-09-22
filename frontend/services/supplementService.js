import api from "./api";

//GET all supplements for the current user
export async function getSupplements() {
    const res = await api.get("/supplements");
    return res.data;
};

//POST a new supplement for the current user
export async function createSupplement(supplement) {
    const res = await api.post("/supplements", supplement);
    return res.data;
};

//PATCH an exsisting supplement
export async function updateSupplement(id, supplement) {
    const res = await api.patch(`/supplements/${id}`, supplement);
    return res.data;
};

//DELETE an exsisting suppliment
export async function deleteSupplement(id) {
    const res = await api.delete(`/supplements/${id}`);
}
