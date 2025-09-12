import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

//identifyer for interacting with storage 
const key = "accessToken";

/**
 * uses expo-secure-store first
 * fallback to async-storage
 */

//save token 
export async function saveToken(token) {
    try{
        await SecureStore.setItemAsync(key, token);
    } catch {
        await AsyncStorage.setItem(key, token);
    }
}

//load token
export async function loadToken() {
    try{
        const loadedToken = await SecureStore.getItemAsync(key);
        if (loadedToken){
            return loadedToken;
        }
    } catch {}
    return AsyncStorage.getItem(key);
}

//clear token from storage
export async function clearToken() {
    try {
        await SecureStore.deleteItemAsync(key);
    } catch {}
    await AsyncStorage.removeItem(key);
}