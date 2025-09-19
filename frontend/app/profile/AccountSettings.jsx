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

export default function AccountSettings() {
  const theme = Colors["dark"];
  const navigation = useNavigation();
  const [profileImage, setProfileImage] = useState(null);
  const [selectedDob, setSelectedDob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [errors, setErrors] = useState({});

  const toYmd = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");
  const fromYmd = (s) => (s ? new Date(s) : null);

  // Form state for all input fields
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

  //Fetch profile on mount and prefill form
  useEffect(() => {
    let alive = true;
    (async () => {
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
          height: me.quiz?.Height?.toString() ?? "",
          weight: me.quiz?.Weight?.toString() ?? "",
        }));

        setSelectedDob(fromYmd(dobStr));

        if (me.pfp) {
          setProfileImage({ uri: me.pfp });
        }
      } catch (e) {
        if (!alive) return;
        const msg = e?.response?.data?.error || "Failed to load profile";
        setLoadError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Validate inputs
  const validateForm = () => {
    const newErrors = {};

    if (!/^[A-Za-z]+$/.test(form.firstName.trim())) {
      newErrors.firstName = "First name must contain only letters."; //first name must only contain letter no numbers etc
    }
    if (!/^[A-Za-z]+$/.test(form.lastName.trim())) {
      newErrors.lastName = "Last name must contain only letters."; //last name only contains letters
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "Invalid email format."; //email must be valid
    }
    if (form.password.length > 0 && form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters."; //password to be at least 8 characters
    }
    if (form.waterGoal && !/^\d+(\.\d+)?L$/i.test(form.waterGoal.trim())) {
      newErrors.waterGoal = "Water goal must be like '2L' or '2.5L'."; //water in L
    }

    console.log(newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Pick profile image from gallery
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
        [{ resize: { width: 512 } }],
        {
          compress: 0.7,
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

  // Handle input changes
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  //Save chances to backend
  const handleSave = async () => {
    if (!validateForm()) {
      // Show toast if validation fails
      CustomToast.validationError("Please fix the errors before saving.");
      return; //if requirements not met return error
    }

    try {
      const firstname = form.firstName.trim();
      const lastname = form.lastName.trim();
      const email = form.email.trim().toLowerCase();
      const dateofbirth = form.dob;

      //Build data URL if we have base64
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

      // send to backend
      await updateMe({
        firstname,
        lastname,
        email,
        dateofbirth,
        ...(form.password ? { password: form.password } : {}),
        ...(pfp ? { pfp } : {}),
        quiz,
      });

      // Show success toast when info saved
      CustomToast.success("Saved!", "Your information has been updated.");
    } catch (e) {
      const msg = e?.response?.data?.error || "Update failed";
      console.log(msg);
    }
  };

  const handleDobChange = (date) => {
    setSelectedDob(date);
    setForm((prev) => ({ ...prev, dob: toYmd(date) }));
  };

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
        {/* Back button to go back to home page */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("home/index")}
        >
          <Ionicons name="arrow-back" size={16} color="black" />
        </TouchableOpacity>

        {/* Page header */}
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Your Account Settings
        </Text>

        {/* Scrollable form */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Picture */}
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
            {/* Edit icon for profile image */}
            <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
              <Ionicons name="pencil" size={18} color="white" />
            </TouchableOpacity>
          </View>

          {/* Form Fields*/}
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

            {/* Quiz Questions */}
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

            <CustomInput
              label="Height in cm (editable via biometrics log)"
              value={form.height}
              editable={false} // read-only
              keyboardType="numeric"
              inputStyle={{ color: "white" }}
            />

            <CustomInput
              label="Weight in kg (editable via biometrics log)"
              value={form.weight}
              editable={false} // read-only
              keyboardType="numeric"
              inputStyle={{ color: "white" }}
            />

            <CustomInput
              label="Water Intake Goal (millilitres)"
              placeholder="e.g. 2L per day"
              value={form.waterGoal}
              onChangeText={(text) => handleChange("waterGoal", text)}
            />

            <CustomInput
              label="Calories Intake Goal (kcal)"
              placeholder="e.g. 2000 kcal"
              value={form.caloriesGoal}
              onChangeText={(text) => handleChange("caloriesGoal", text)}
            />
          </View>

          {/* Logout button */}
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

          {/* Extra spacing to avoid save button overlap */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Sticky Save Button at the bottom */}
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

      {/* Toast for notifications */}
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
