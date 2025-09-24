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
import globalStyles from "../../styles/globalStyles";
import CustomInput from "../../components/common/CustomInput";
import CustomButton from "../../components/common/CustomButton";
import { signup } from "@/services/userService";
import { login } from "@/services/authService";
import CustomToast from "../../components/common/CustomToast";

/**
 * Validates name fields (firstName, lastName)
 * Checks for presence, minimum length, and valid characters
 */
const nameValidation = (name) => {
  if (!name || !name.trim()) return "This field is required";
  if (name.trim().length < 2) return "Name must be at least 2 characters";
  if (!/^[a-zA-Z\s]+$/.test(name.trim()))
    return "Name can only contain letters and spaces";
  return null;
};

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

/**
 * Validates password strength requirements
 * Enforces minimum length and character type requirements
 */
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

/**
 * Validates date of birth with age restrictions
 * Ensures user is between 13 and 120 years old
 */
const dateValidation = (date) => {
  if (!date) return "Please select your date of birth";
  const today = new Date();
  const birthDate = new Date(date);
  const age = today.getFullYear() - birthDate.getFullYear();

  if (age < 13) return "You must be at least 13 years old";
  if (age > 120) return "Please enter a valid birth date";
  return null;
};

/**
 * User registration form component with comprehensive validation
 * Handles account creation and automatic login upon success
 */
export default function SignUp() {
  const router = useRouter();
  const theme = Colors["dark"];
  const insets = useSafeAreaInsets();

  // Form data state for all user inputs
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  // UI and validation state management
  const [busy, setBusy] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  /**
   * Updates form data for a specific field and clears validation errors
   * Only performs live validation after first submission attempt
   */
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field errors on input change after first validation attempt
    if (hasAttemptedSubmit && errors[field]) {
      let fieldError = null;
      switch (field) {
        case "firstName":
        case "lastName":
          fieldError = nameValidation(value);
          break;
        case "email":
          fieldError = emailValidation(value);
          break;
        case "password":
          fieldError = passwordValidation(value);
          break;
      }
      if (!fieldError) {
        setErrors((prev) => ({ ...prev, [field]: null }));
      }
    }
  };

  /**
   * Handles date selection with live validation after first attempt
   */
  const handleDateChange = (date) => {
    setSelectedDate(date);

    if (hasAttemptedSubmit && errors.dateOfBirth) {
      const dateError = dateValidation(date);
      if (!dateError) setErrors((prev) => ({ ...prev, dateOfBirth: null }));
    }
  };

  /**
   * Validates all form fields and returns validation status
   * Sets error state for any invalid fields
   */
  const validateForm = () => {
    const newErrors = {};

    const firstNameError = nameValidation(formData.firstName);
    if (firstNameError) newErrors.firstName = firstNameError;

    const lastNameError = nameValidation(formData.lastName);
    if (lastNameError) newErrors.lastName = lastNameError;

    const emailError = emailValidation(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = passwordValidation(formData.password);
    if (passwordError) newErrors.password = passwordError;

    const dateError = dateValidation(selectedDate);
    if (dateError) newErrors.dateOfBirth = dateError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission with account creation and automatic login
   * Navigates to profile quiz on successful registration
   */
  const handleContinue = async () => {
    setHasAttemptedSubmit(true);

    if (validateForm()) {
      const firstname = formData.firstName.trim();
      const lastname = formData.lastName.trim();
      const email = formData.email.trim().toLowerCase();
      const password = formData.password;
      const dateofbirth = selectedDate;

      try {
        setBusy(true);
        await signup({ firstname, lastname, email, dateofbirth, password });
        await login(email, password);
        CustomToast.success(
          "Welcome to Fitahi!",
          "Account created successfully"
        );
        router.push("/profile/quiz");
      } catch (err) {
        // Provide user-friendly error messages based on server response
        const status = err?.response?.status;
        const serverMsg = err?.response?.data?.error;
        const msg =
          serverMsg || `Sign up failed${status ? ` (${status})` : ""}`;
        CustomToast.error(msg);
        console.log(msg);
        
        // Log detailed error info for debugging when no server message is available
        if (!serverMsg)
          console.log("SIGNUP ERROR:", {
            status,
            data: err?.response?.data,
            message: err?.message,
            code: err?.code,
          });
      } finally {
        setBusy(false);
      }
    } else {
      CustomToast.validationError("Please fix the errors below");
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
          {/* Welcome message and instructions */}
          <Text
            style={[
              globalStyles.welcomeText,
              { color: "#00A2FF", fontSize: 28, textAlign: "center" },
            ]}
          >
            We're happy to have you!
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
            Now let's set up your profile.
          </Text>

          {/* Registration form with validation */}
          <View style={styles.formContainer}>
            <CustomInput
              label="First Name"
              placeholder="First Name"
              value={formData.firstName}
              onChangeText={(text) => updateField("firstName", text)}
              errorMessage={errors.firstName}
              required
            />

            <CustomInput
              label="Last Name"
              placeholder="Last Name"
              value={formData.lastName}
              onChangeText={(text) => updateField("lastName", text)}
              errorMessage={errors.lastName}
              required
            />

            <CustomInput
              label="Date of Birth"
              placeholder="Choose a date"
              isDatePicker={true}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              errorMessage={errors.dateOfBirth}
              required
            />

            <CustomInput
              label="Email Address"
              placeholder="Email address"
              value={formData.email}
              onChangeText={(text) => updateField("email", text)}
              keyboardType="email-address"
              errorMessage={errors.email}
              required
            />

            <CustomInput
              label="Password"
              placeholder="Password"
              value={formData.password}
              onChangeText={(text) => updateField("password", text)}
              secureTextEntry
              errorMessage={errors.password}
              required
            />
          </View>

          {/* Submit button */}
          <View style={{ width: "100%", alignItems: "center", marginTop: 20 }}>
            <CustomButton
              title="Continue"
              onPress={handleContinue}
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

  formContainer: { width: "100%", alignItems: "center" },

  errorText: {
    color: "#FF4D4D",
    fontSize: 14,
    marginTop: 10,
  },
});