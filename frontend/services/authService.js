import api, { setAuthToken } from "./api";
import { saveToken, loadToken, clearToken } from "./tokenStorage";
import { cancelAllNotifications } from "./notificationService";

//loads token from tokenstorage and tries to load user data
export async function loadTokenOnLaunch() {
    const token = await loadToken();
    if (!token) {
        return null;
    }

    //set auth token to loaded token 
    setAuthToken(token);

    //try to load user data with loaded token    
    try {
        const { data } = await api.get('users/me');
        return data?.user ?? data ?? null;
    } catch {
        //token invalid or expired 
        setAuthToken(null);
        await clearToken();
        return null;
    }
}

//login function to auth and recive token from backend and return user
export async function login(email, password) {
    const res = await api.post('auth/login', { email, password });
    const { token, user } = res.data;

    await saveToken(token);
    setAuthToken(token);

    return user;
}

//logout, clears tokens and notifications
export async function logout() {
    setAuthToken(null);
    await clearToken();

    // cancel all scheduled notifications
    try {
        await cancelAllNotifications();
        console.log('All notifications cleared on logout');
    } catch (err) {
        console.warn('Failed to clear notifications on logout', err);
    }
}
