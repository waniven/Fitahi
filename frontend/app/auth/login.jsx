import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import FitahiLogo from "../../constants/FitahiLogo";
import CustomInput from "../../components/common/CustomInput";
import CustomButton from "../../components/common/CustomButton";
import CustomToast from "../../components/common/CustomToast";
import globalStyles from "../../styles/globalStyles";
import { login } from "../../services/authService";

/**
 * Login screen component with form validation and authentication
 * Handles user login with email/password and navigates to home on success
 */
export default function Login() {
  const router = useRouter();
  const theme = Colors["dark"];
  const insets = useSafeAreaInsets();

  // Form state management
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);

  /**
   * Validates email format and presence
   * Returns cleaned email string or error message
   */
  const validateEmail = (email) => {
    if (!email || !email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim()))
      return "Please enter a valid email address";
    return email.trim();
  };

  /**
   * Validates password presence
   * Returns password or error message
   */
  const validatePassword = (password) => {
    if (!password || !password.trim()) return "Password is required";
    return password;
  };

  /**
   * Updates form field value and clears validation errors if user has previously attempted login
   */
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (hasAttemptedLogin && errors[field]) {
      let fieldError = null;
      if (field === "email") fieldError = validateEmail(value);
      else if (field === "password") fieldError = validatePassword(value);
      if (!fieldError)
        CustomToast.error((prev) => ({ ...prev, [field]: null }));
    }
  };

  /**
   * Handles login form submission with validation and error handling
   * Navigates to home screen on successful authentication
   */
  const handleLogin = async () => {
    const email = validateEmail(formData.email);
    const password = validatePassword(formData.password);

    try {
      setBusy(true);
      await login(email, password);
      CustomToast.success("Welcome Back!", "Login successful");
      router.replace("/home");
    } catch (err) {
      // Provide user-friendly error messages based on server response
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.error;
      const msg = serverMsg || `Login failed${status ? ` (${status})` : ""}`;
      CustomToast.error(msg);
      
      // Log detailed error info for debugging when no server message is available
      if (!serverMsg)
        console.log("LOGIN ERROR:", {
          status,
          data: err?.response?.data,
          message: err?.message,
          code: err?.code,
        });
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Keyboard avoidance with platform-specific behavior */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: 40 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* App logo section */}
          <View style={styles.logoContainer}>
            <FitahiLogo width={260} height={100} fill="#FFFFFF" />
          </View>

          {/* Welcome text and instructions */}
          <Text
            style={[
              globalStyles.welcomeText,
              { color: "#00A2FF", fontSize: 28, textAlign: "center" },
            ]}
          >
            Welcome back!
          </Text>
          <Text
            style={[
              globalStyles.cardText,
              {
                color: "#00A2FF",
                fontSize: 16,
                marginBottom: 30,
                textAlign: "center",
              },
            ]}
          >
            Please log in with your email and password
          </Text>

          {/* Login form inputs */}
          <View style={styles.formContainer}>
            <CustomInput
              label="Email Address"
              placeholder="Email Address"
              value={formData.email}
              onChangeText={(text) => updateField("email", text)}
              keyboardType="email-address"
              required
            />

            <CustomInput
              label="Password"
              placeholder="Password"
              value={formData.password}
              onChangeText={(text) => updateField("password", text)}
              secureTextEntry
              required
            />
          </View>

          {/* Login submit button */}
          <View style={{ width: "100%", alignItems: "center", marginTop: 20 }}>
            <CustomButton
              title="Log In"
              onPress={handleLogin}
              size="large"
              style={{ width: 370, paddingVertical: 18, borderRadius: 30 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 80,
    alignItems: "center",
    flexGrow: 1,
  },

  logoContainer: { marginBottom: 30 },

  formContainer: { width: "100%", alignItems: "center" },
});