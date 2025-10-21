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
import { useRouter } from "expo-router";
import CustomButtonThree from "../../components/common/CustomButtonThree";
import { Ionicons } from "@expo/vector-icons"; 


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
  const [code, setCode] = useState(""); // Expected: numeric string from email
  const [password, setPassword] = useState(""); // Expected: new password string
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // Toggle state for password visibility
  const [passwordError, setPasswordError] = useState(null); // Tracks validation error for password

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
    setPasswordError(error); // Show inline error
    CustomToast.validationError("Please fix the error below"); // Show toast
    return;
  }

  setPasswordError(null); // Clear error if valid

  // TODO: Backend API call to verify code and reset password
  // { code: string, password: string }
  CustomToast.success("Password Reset!", "Your password has been updated");
  router.replace("/"); // Navigate to welcome page
};


  // Triggered when user taps "Resend email"
  const handleResendEmail = () => {
    // TODO: Backend call to resend recovery code
    // { email: string } — email should be stored from previous step
    CustomToast.success("Email resent!", "Recovery code has been sent"); 
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Back button in top-left corner */}
      <CustomButtonThree
        onPress={() => router.replace("/")}
        style={{ position: "absolute", top: 50, left: 20, zIndex: 10 }}
      />

      {/* Centered header aligned vertically with back button */}
      <Text style={styles.header}>Reset Password</Text>

      {/* KeyboardAvoidingView ensures input fields stay visible when keyboard opens */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Main content block: subtext + input fields + resend link */}
        <View style={styles.content}>
          {/* Instructional subtext for user */}
          <Text style={styles.subText}>
            Please fill out the recovery code and a new password for your Fitahi account.
          </Text>

          {/* Recovery code input field */}
          <CustomInput
            label="Recovery Code"
            placeholder="Enter recovery code"
            value={code}
            onChangeText={(text) => setCode(text.replace(/[^0-9]/g, ""))} // Only allow numeric input
            keyboardType="numeric"
            textStyle={{ fontFamily: "Montserrat-Regular" }} 
            labelStyle={{ fontFamily: "Montserrat-Bold" }} 
          />

          {/* Password input field with animated eye icon and long-press support */}
          <View style={{ position: "relative" }}>
            <CustomInput
             label="New Password"
             placeholder="Enter new password"
             value={password}
             onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError(null); // Clear error on change
            }}
            secureTextEntry={!isPasswordVisible}
            textStyle={{ fontFamily: "Montserrat-Regular" }}
            labelStyle={{ fontFamily: "Montserrat-Bold" }}
            errorMessage={passwordError} 
          />
            <TouchableOpacity
              onPress={() => {
                setIsPasswordVisible((prev) => !prev); // Toggle visibility on tap
                animateIcon(); // Trigger animation
              }}
              style={{ position: "absolute", right: 10, top: 35 }}
            >
              <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                <Ionicons
                  name={isPasswordVisible ? "eye" : "eye-off"} // Icon changes based on visibility
                  size={24}
                  color="#A9A9A9"
                />
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Resend email link — triggers backend resend logic */}
          <TouchableOpacity onPress={handleResendEmail}>
            <Text style={styles.resend}>Resend email</Text>
          </TouchableOpacity>
        </View>

        {/* Submit button fixed at bottom of screen */}
        <View style={styles.bottomButton}>
          <CustomButton
            title="Create New Password"
            onPress={handleCreateNewPassword}
            size="large"
            style={{width: 370, paddingVertical: 18, borderRadius: 30}}
            textColor="#FFFFFF"
            textStyle={{ fontFamily: "Montserrat-Bold" }} 
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
    fontFamily: "Montserrat-Bold", 
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
    fontFamily: "Montserrat-Bold",
  },
  resend: {
    color: "#A9A9A9", 
    textAlign: "left",
    marginTop: 10,
    textDecorationLine: "underline", 
    alignSelf: "flex-start", 
    fontFamily: "Montserrat-Regular", 
  },
  bottomButton: {
  position: "absolute",
  bottom: 20,
  left: 0,
  right: 0,
  alignItems: "center",
},

});
