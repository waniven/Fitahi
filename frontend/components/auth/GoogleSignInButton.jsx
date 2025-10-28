import React, { useEffect, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import CustomButton from "../common/CustomButton";
import { loginWithGoogleIdToken, IncompleteProfileError } from "../../services/authService";
import CustomToast from "../common/CustomToast";

WebBrowser.maybeCompleteAuthSession();

const expoClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;


export default function GoogleSignInButton({
    title = "Sign In with Google",
    size = "large",
    rounded = true,
    variant = "secondary",
    style,
    }) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);

    const [request, response, promptAsync] = Google.useAuthRequest({
        expoClientId,
        iosClientId,        // keep these if you have them; otherwise undefined is fine in Expo Go
        androidClientId,
        webClientId,
        scopes: ["openid", "email", "profile"],
    });

    useEffect(() => {
        async function handle() {
        if (response?.type !== "success") return;
        const id_token = response?.authentication?.idToken;
        if (!id_token) {
            CustomToast.error("Google sign in failed");
            return;
        }
        try {
            setBusy(true);
            await loginWithGoogleIdToken(id_token); // saves JWT via your service
            router.replace("/home"); //goes to home
        } catch (e) {
            if (e instanceof IncompleteProfileError) {
            router.push({
                pathname: "/profile/Quiz", //takes user to quiz section
                params: {
                prefills: JSON.stringify(e.payload?.prefills || {}),
                missing: JSON.stringify(e.payload?.missing || []),
                },
            });
            } else {
            const msg = e?.response?.data?.error || e?.message || "Sign in error";
            Alert.alert("Google sign in error", String(msg));
            }
        } finally {
            setBusy(false);
        }
        }
        handle();
    }, [response]);

    return (
        <CustomButton
        title={busy ? "Signing in..." : title}
        onPress={() => promptAsync()}
        variant={variant}
        size={size}
        rounded={rounded}
        disabled={!request || busy}
        style={style}
        />
    );
}
