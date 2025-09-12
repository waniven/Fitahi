import api, { setAuthToken } from "./api";
import { saveToken, loadToken, clearToken } from "./tokenStorage";

//loads token from tokenstorage and tries to load user data
export async function loadTokenOnLaunch() {
    const token = await loadToken();
    if (!token){
        return null;
    } 

    //set auth token to loaded token 
    setAuthToken(token);
    
    //try to load user data with loaded token    
    try{
        const { data } = await api.get('/user/me');
        return data?.user ?? data ?? null;
    } catch {
        //token invalid or expired 
        setAuthToken(null);
        await clearToken();
        return null;   
    }
}

//login function to auth and recive token from backend and return user
export async function Login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;

    await saveToken(token);
    setAuthToken(token);

    return user;
}

//logout, clears tokens 
export async function logout() {
    setAuthToken(null);
    await clearToken();
}