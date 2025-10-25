import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomInput from "../../components/common/CustomInput";
import CustomButton from "../../components/common/CustomButton";
import CustomToast from "../../components/common/CustomToast";
import { Colors } from "../../constants/Colors";
import { Font, Type, TextVariants } from "../../constants/Font";
import { useRouter } from "expo-router";
import CheckEmailModal from "../../components/modals/CheckEmailModal";
import CustomButtonThree from "../../components/common/CustomButtonThree";
import * as passwordResetService from "../../services/passwordResetService";

/**
 * Validates email format and presence
 * Uses regex pattern to ensure proper email structure
 */
const emailValidation = (email) => {
  if (!email || !email.trim()) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim()))
    return "Please enter a valid email address";
  return null;
};

export default function ResetPasswordEmail() {
  const router = useRouter();
  const theme = Colors["dark"];

  //local state for email input
  const [email, setEmail] = useState(""); //valid email string
  //controls visibility of confirmation modal
  const [showModal, setShowModal] = useState(false);

  //triggered when user presses "send recovery code"
  const handleSendCode = async () => {
    const emailError = emailValidation(email);
    if (emailError) return CustomToast.error(emailError);

    try {
      await passwordResetService.sendResetEmail(email); 
      console.log("reset email sent");
      CustomToast.success("Reset email sent, check your inbox");
      setShowModal(true); // or navigate immediately here
    } catch (err) {
      console.log("sendResetEmail failed:", err.response?.data || err.message);
      CustomToast.error("Could not send reset email");
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Back button */}
      <CustomButtonThree
        onPress={() => router.replace("/")} //navigate to welcome page
        style={{ position: "absolute", top: 50, left: 20, zIndex: 10 }}
      />

      {/* Header near back button */}
      <Text style={[styles.header, TextVariants.h1]}>Reset Password</Text>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Subheader + input */}
        <View style={styles.content}>
          <Text style={[styles.subText, Type.semibold]}>
            Please provide us with the registered email and we will send you a
            recovery code.
          </Text>

          <CustomInput
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={{ marginTop: 20 }}
            textStyle={Type.regular}
            labelStyle={Type.bold}
          />
        </View>

        {/* Button pinned at the bottom */}
        <View style={styles.bottomButton}>
          <CustomButton
            title="Send Recovery Code"
            onPress={handleSendCode}
            variant="primary"
            size="large"
            rounded
            style={{ width: "100%" }}
          />
        </View>

        {/* Modal confirmation after send code */}
        {showModal && (
          <CheckEmailModal
            onClose={() => {
              setShowModal(false); //hide modal
              router.push("/auth/ResetPasswordNew"); //navigate to next screen
            }}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    alignItems: "center",
    paddingTop: 120,
    paddingHorizontal: 20,
  },
  subText: {
    color: "gray",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
  },
  bottomButton: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
});
