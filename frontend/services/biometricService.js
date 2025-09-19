import api from "./api";

// GET all biometric logs for logged-in user
export async function getBiometrics() {
    const res = await api.get("/biometrics");
    return res.data;
};

// GET a single biometric log by id
export async function getBiometricById(id) {
    const res = await api.get(`/biometrics/${id}`);
    return res.data;
};

// POST a new biometric log
export async function createBiometric(biometric) {
    const res = await api.post("/biometrics", biometric);
    return res.data;
};

// DELETE a biometric
export async function deleteBiometric(id) {
    await api.delete(`/biometrics/${id}`);
};
