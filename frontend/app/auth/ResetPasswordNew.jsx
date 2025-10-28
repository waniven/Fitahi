import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomInput from "../../components/common/CustomInput";
import CustomButton from "../../components/common/CustomButton";
import CustomToast from "../../components/common/CustomToast";
import { Colors } from "../../constants/Colors";
import { Font, Type, TextVariants } from "../../constants/Font";
import { useRouter } from "expo-router";
import CustomButtonThree from "../../components/common/CustomButtonThree";
import { Ionicons } from "@expo/vector-icons";
import * as passwordResetService from "../../services/passwordResetService";

// Password validation logic
const passwordValidation = (password) => {
  if (!password || !password.trim()) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/(?=.*[a-z])/.test(password))
    return "Password must contain a lowercase letter";
  if (!/(?=.*[A-Z])/.test(password))
    return "Password must contain an uppercase letter";
  if (!/(?=.*\d)/.test(password)) return "Password must contain a number";
  return null;
};

export default function ResetPasswordNew() {
  const router = useRouter();
  const theme = Colors["dark"];

  // Local state for recovery code and password
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  // Animation state for eye icon
  const iconScale = useRef(new Animated.Value(1)).current;

  // Animate eye icon when toggled
  const animateIcon = () => {
    Animated.sequence([
      Animated.timing(iconScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(iconScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Triggered when user taps "Create New Password"
  const handleCreateNewPassword = async () => {
    if (!code.trim()) {
      CustomToast.error("Please enter the recovery code");
      return;
    }

    const error = passwordValidation(password);
    if (error) {
      setPasswordError(error);
      CustomToast.validationError("Please fix the error below");
      return;
    }

    setPasswordError(null);

    try {
      await passwordResetService.resetPassword(code, password);
      CustomToast.success("Password Reset!");
      router.replace("/");
    } catch (err) {
      console.log("resetPassword failed:", err.response?.data || err.message);
      CustomToast.error("Invalid or expired code");
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Back button in top-left corner */}
      <CustomButtonThree
        onPress={() => router.replace("/")}
        style={{ position: "absolute", top: 50, left: 20, zIndex: 10 }}
      />

      {/* Centered header aligned vertically with back button */}
      <Text style={[styles.header, TextVariants.h1]}>Reset Password</Text>

      {/* KeyboardAvoidingView ensures input fields stay visible when keyboard opens */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Main content block: subtext + input fields + resend link */}
        <View style={styles.content}>
          {/* Instructional subtext for user */}
          <Text style={[styles.subText, Type.semibold]}>
            Please fill out the recovery code and a new password for your Fitahi
            account.
          </Text>

          {/* Recovery code input field */}
          <CustomInput
            label="Recovery Code"
            placeholder="Enter recovery code"
            value={code}
            onChangeText={(text) => setCode(text.replace(/[^0-9]/g, ""))}
            keyboardType="numeric"
            textStyle={Type.regular}
            labelStyle={Type.bold}
          />

          {/* Password input field with animated eye icon and long-press support */}
          <View style={{ position: "relative" }}>
            <CustomInput
              label="New Password"
              placeholder="Enter new password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError(null);
              }}
              secureTextEntry={!isPasswordVisible}
              textStyle={Type.regular}
              labelStyle={Type.bold}
              errorMessage={passwordError}
            />
            <TouchableOpacity
              onPress={() => {
                setIsPasswordVisible((prev) => !prev);
                animateIcon();
              }}
              style={{ position: "absolute", right: 10, top: 35 }}
            >
              <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                <Ionicons
                  name={isPasswordVisible ? "eye" : "eye-off"}
                  size={24}
                  color="#A9A9A9"
                />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit button fixed at bottom of screen */}
        <View style={styles.bottomButton}>
          <CustomButton
            title="Create New Password"
            onPress={handleCreateNewPassword}
            variant="primary"
            size="large"
            rounded
            style={{ width: "100%" }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    color: "#FFFFFF",
    fontSize: 26,
    textAlign: "center",
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 120,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  subText: {
    color: "gray",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
  },
  resend: {
    color: "#A9A9A9",
    textAlign: "left",
    marginTop: 10,
    textDecorationLine: "underline",
    alignSelf: "flex-start",
  },
  bottomButton: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
});
