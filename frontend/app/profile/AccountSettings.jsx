import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useNavigation } from "@react-navigation/native";
import { getMe, updateMe } from "@/services/userService";
import { logout } from "@/services/authService";
import { router } from "expo-router";
import CustomInput from "../../components/common/CustomInput";
import CustomToast from "@/components/common/CustomToast";
import Toast from "react-native-toast-message";
import { Font } from "@/constants/Font";
import CustomButton from "../../components/common/CustomButton";
import { getBiometrics } from "@/services/biometricService";

/**
 * Account settings screen for managing user profile and preferences
 * Handles profile updates, image uploads, form validation, and user logout
 */
export default function AccountSettings() {
  const theme = Colors["dark"];
  const navigation = useNavigation();
  
  // Profile image state with URI and base64 data for upload
  const [profileImage, setProfileImage] = useState(null);
  
  // Date picker state for date of birth selection
  const [selectedDob, setSelectedDob] = useState(null);
  
  // Loading and error states for data fetching
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  
  // Form validation error messages
  const [errors, setErrors] = useState({});

  // Date conversion helpers for API compatibility
  const toYmd = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");
  const fromYmd = (s) => (s ? new Date(s) : null);

  // Comprehensive form state containing all user profile fields
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    email: "",
    password: "",
    fitnessGoal: "",
    fitnessLevel: "",
    trainingTime: "",
    trainingDays: "",
    diet: "",
    height: "",
    weight: "",
    waterGoal: "",
    caloriesGoal: "",
  });

  // Fetches user profile and latest biometric data on component mount
  useEffect(() => {
    let alive = true;

    const fetchProfileAndBiometrics = async () => {
      try {
        setLoading(true);
        const me = await getMe();
        if (!alive) return;

        const dobStr = toYmd(me.dateofbirth);

        setForm((prev) => ({
          ...prev,
          firstName: me.firstname ?? "",
          lastName: me.lastname ?? "",
          email: me.email ?? "",
          dob: dobStr,
          fitnessGoal: me.quiz?.FitnessGoal ?? "",
          fitnessLevel: me.quiz?.FitnessLevel ?? "",
          trainingDays: me.quiz?.TrainingDays ?? "",
          trainingTime: me.quiz?.TrainingTime ?? "",
          diet: me.quiz?.Diet ?? "",
          waterGoal: me.intakeGoals?.dailyWater.toString() ?? "",
          caloriesGoal: me.intakeGoals?.dailyCalories.toString() ?? "",
        }));
        setSelectedDob(fromYmd(dobStr));
        if (me.pfp) setProfileImage({ uri: me.pfp });

        // Fetches most recent biometric entry to populate height/weight
        const biometrics = await getBiometrics();
        if (biometrics.length > 0) {
          const latest = biometrics[0];
          setForm((prev) => ({
            ...prev,
            height: latest.height?.toString() ?? prev.height,
            weight: latest.weight?.toString() ?? prev.weight,
          }));
        } else {
          // fallback to quiz data
          setForm((prev) => ({
            ...prev,
            height: me.quiz?.Height?.toString() ?? prev.height,
            weight: me.quiz?.Weight?.toString() ?? prev.weight,
          }));
        }
      } catch (err) {
        if (!alive) return;
        CustomToast.error(
          "Fetching information failed",
          "Please try again later."
        );
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchProfileAndBiometrics();
    return () => {
      alive = false;
    };
  }, []);

  // Validates all form inputs with specific rules for each field
  const validateForm = () => {
    const newErrors = {};

    if (!/^[A-Za-z]+$/.test(form.firstName.trim())) {
      newErrors.firstName = "First name must contain only letters.";
    }
    if (!/^[A-Za-z]+$/.test(form.lastName.trim())) {
      newErrors.lastName = "Last name must contain only letters.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "Invalid email format.";
    }
    if (form.password.length > 0 && form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    if (
      form.waterGoal &&
      !/^(?:[1-5]\d{3}(?:\.\d+)?|6000(?:\.0+)?)\s*(?:l)?$/i.test(
        String(form.waterGoal).trim()
      )
    ) {
      newErrors.waterGoal = "Water goal must be 1000ml to 6000ml.";
    }
    if (
      form.caloriesGoal &&
      !/^(?:[1-5]\d{3}(?:\.\d+)?|4000(?:\.0+)?)\s*(?:l)?$/i.test(
        String(form.waterGoal).trim()
      )
    ) {
      newErrors.caloriesGoal = "Calorie goal must be 1000kcal to 4000kcal.";
    }

    console.log(newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Opens image picker and processes selected image for profile picture
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      base64: true,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const a = result.assets[0];
      const manip = await ImageManipulator.manipulateAsync(
        a.uri,
        [{ resize: { width: 256 } }],
        {
          compress: 0.5,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      setProfileImage({
        uri: manip.uri,
        base64: manip.base64,
        mime: "image/jpeg",
      });
    }
  };

  // Updates form state when input values change
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Validates form and saves all changes to the backend
  const handleSave = async () => {
    if (!validateForm()) {
      CustomToast.validationError("Please fix the errors before saving.");
      return;
    }

    try {
      const firstname = form.firstName.trim();
      const lastname = form.lastName.trim();
      const email = form.email.trim().toLowerCase();
      const dateofbirth = form.dob;

      // Converts profile image to data URL format for API upload
      const pfp = profileImage?.base64
        ? `data:${profileImage.mime};base64,${profileImage.base64}`
        : undefined;

      const quiz = {
        FitnessGoal: form.fitnessGoal || null,
        FitnessLevel: form.fitnessLevel || null,
        TrainingDays: form.trainingDays || null,
        TrainingTime: form.trainingTime || null,
        Diet: form.diet || null,
      };

      const intakeGoals = {
        dailyCalories: form.caloriesGoal,
        dailyWater: form.waterGoal,
      };

      // send to backend
      await updateMe({
        firstname,
        lastname,
        email,
        dateofbirth,
        ...(form.password ? { password: form.password } : {}),
        ...(pfp ? { pfp } : {}),
        quiz,
        intakeGoals,
      });

      CustomToast.success("Saved!", "Your information has been updated.");
    } catch (e) {
      CustomToast.error("Save Failed", "Please try again later.");
    }
  };

  // Updates both form state and date picker when date of birth changes
  const handleDobChange = (date) => {
    setSelectedDob(date);
    setForm((prev) => ({ ...prev, dob: toYmd(date) }));
  };

  // Logs out user and redirects to login screen
  const handleLogout = () => {
    console.log("logout");
    logout();
    router.replace("/");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={1}
      >
        {/* Back navigation button to return to home screen */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("home/index")}
        >
          <Ionicons name="arrow-back" size={16} color="black" />
        </TouchableOpacity>

        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Your Account Settings
        </Text>

        {/* Scrollable form container with all input fields */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile picture section with edit functionality */}
          <View style={styles.profilePicWrapper}>
            <View style={styles.profileCircle}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage.uri }}
                  style={styles.profileImage}
                />
              ) : (
                <Ionicons name="person" size={60} color="white" />
              )}
            </View>
            <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
              <Ionicons name="pencil" size={18} color="white" />
            </TouchableOpacity>
          </View>

          {/* Basic profile information inputs */}
          <View style={styles.formContainer}>
            <CustomInput
              label="First Name"
              placeholder="First Name"
              value={form.firstName}
              onChangeText={(text) => handleChange("firstName", text)}
              errorMessage={errors.firstName}
              required
            />

            <CustomInput
              label="Last Name"
              placeholder="Last Name"
              value={form.lastName}
              onChangeText={(text) => handleChange("lastName", text)}
              errorMessage={errors.lastName}
              required
            />

            <CustomInput
              label="Date of Birth"
              placeholder="Choose a date"
              isDatePicker
              selectedDate={selectedDob}
              onDateChange={handleDobChange}
              required
            />

            <CustomInput
              label="Email Address"
              placeholder="Email address"
              value={form.email}
              onChangeText={(text) => handleChange("email", text)}
              keyboardType="email-address"
              errorMessage={errors.email}
              required
            />

            <CustomInput
              label="Password"
              placeholder="Password"
              value={form.password}
              onChangeText={(text) => handleChange("password", text)}
              errorMessage={errors.password}
              secureTextEntry
            />

            {/* Fitness quiz preferences section */}
            <Text style={[styles.title, { color: "#fff" }]}>
              Quiz Questions
            </Text>

            <CustomInput
              label="Fitness Goal"
              placeholder="e.g. Lose weight"
              value={form.fitnessGoal}
              onChangeText={(text) => handleChange("fitnessGoal", text)}
            />

            <CustomInput
              label="Fitness Level"
              placeholder="Beginner/Intermediate/Advanced"
              value={form.fitnessLevel}
              onChangeText={(text) => handleChange("fitnessLevel", text)}
            />

            <CustomInput
              label="Days spent training (per week) "
              placeholder="e.g. 3 days/week"
              value={form.trainingDays}
              onChangeText={(text) => handleChange("trainingDays", text)}
            />

            <CustomInput
              label="Time spent training (per session)"
              placeholder="e.g. 1 hour/session"
              value={form.trainingTime}
              onChangeText={(text) => handleChange("trainingTime", text)}
            />

            <CustomInput
              label="Dietary Preference"
              placeholder="e.g. Vegetarian"
              value={form.diet}
              onChangeText={(text) => handleChange("diet", text)}
            />

            {/* Read-only biometric fields populated from latest biometric entry */}
            <CustomInput
              label="Height in cm (editable via biometrics log)"
              value={form.height}
              editable={false}
              keyboardType="numeric"
              inputStyle={{ color: "white" }}
            />

            <CustomInput
              label="Weight in kg (editable via biometrics log)"
              value={form.weight}
              editable={false}
              keyboardType="numeric"
              inputStyle={{ color: "white" }}
            />

            <CustomInput
              label="Daily Water Intake Goal (millilitres)"
              placeholder="e.g. 2500ml per day"
              value={form.waterGoal}
              errorMessage={errors.waterGoal}
              onChangeText={(text) => handleChange("waterGoal", text)}
            />

            <CustomInput
              label="Daily Calories Intake Goal (kcal)"
              placeholder="e.g. 2000 kcal"
              value={form.caloriesGoal}
              errorMessage={errors.caloriesGoal}
              onChangeText={(text) => handleChange("caloriesGoal", text)}
            />
          </View>

          {/* Fixed-position logout button */}
          <View style={styles.logoutButtonWrapper}>
            <CustomButton
              title="Logout"
              onPress={handleLogout}
              variant="error"
              size="large"
              rounded
              style={{ width: "100%" }}
            />
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Fixed-position save button at bottom of screen */}
        <View style={styles.saveButtonWrapper}>
          <CustomButton
            title="Save Information"
            onPress={handleSave}
            variant="primary"
            size="large"
            rounded
            style={{ width: "100%" }}
          />
        </View>
      </KeyboardAvoidingView>

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  formContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },

  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
    backgroundColor: "white",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    elevation: 3,
    shadowColor: "#2b2a2aff",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  title: {
    fontSize: 22,
    textAlign: "center",
    marginVertical: 16,
    fontFamily: Font.bold,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  profilePicWrapper: {
    alignSelf: "center",
    marginVertical: 20,
    position: "relative",
  },
  profileCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007bff",
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
  saveButtonWrapper: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  logoutButtonWrapper: {
    position: "absolute",
    bottom: 110,
    left: 20,
    right: 20,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
    fontFamily: "Montserrat",
  },
});