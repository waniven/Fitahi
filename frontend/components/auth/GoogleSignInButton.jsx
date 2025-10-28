import React, { useEffect } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import CustomButton from "../common/CustomButton";
import { loginWithGoogleIdToken } from "../../services/authService";

export default function GoogleSignInButton({ navigation }) {
    useEffect(() => {
        // Configure Google Signin once when the component mounts
        GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        offlineAccess: false,
        });
    }, []);

    const handleGoogleLogin = async () => {
        try {
        // Ensure device supports Play Services
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

        // Launch native Google Sign-in
        const { idToken } = await GoogleSignin.signIn();

        // Send idToken to your backend (same endpoint as before)
        const success = await loginWithGoogleIdToken(idToken);

        if (success) {
            navigation.replace("Home");
        }
        } catch (error) {
        console.error("Google Sign-In error:", error);
        }
    };

    return (
        <CustomButton
        title="Sign in with Google"
        onPress={handleGoogleLogin}
        icon="google"
        />
    );
}