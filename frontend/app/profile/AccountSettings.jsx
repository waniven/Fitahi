// profile/AccountSettings.jsx
import React, { useEffect, useState } from "react";
import {StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView, Image,} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker"; 
import * as ImageManipulator from 'expo-image-manipulator';
import { useNavigation } from "@react-navigation/native";
import { getMe, updateMe } from "@/services/userService";
import { logout } from "@/services/authService";
import { router } from "expo-router";

export default function AccountSettings() {
  const theme = Colors["dark"];
  const navigation = useNavigation();
  const [profileImage, setProfileImage] = useState(null); // State for profile image
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

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
        const me = await getMe(); //get user info from backend
        if (!alive) return;

        const toYmd = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

        setForm((prev) => ({
          ...prev,
          firstName: me.firstname ?? "",
          lastName : me.lastname ?? "",
          email : me.email ?? "",
          dob : toYmd(me.dateofbirth),
        }));

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
    return () => { alive = false; };
  }, []);

  // Pick profile image from gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      base64: true,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

  if (!result.canceled) {
    const a = result.assets[0];
    const manip = await ImageManipulator.manipulateAsync(
      a.uri,
      [{ resize: { width: 512 } }],//make image smaller for upload
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );

    setProfileImage({
      uri: manip.uri,
      base64: manip.base64,
      mime: 'image/jpeg'
    });
  }
  };

  // Handle input changes
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  //Save chances to backend 
  const handleSave = async () => {
    try {
      const firstname = form.firstName.trim();
      const lastname = form.lastName.trim();
      const email = form.email.trim().toLowerCase();
      const dateofbirth = form.dob; 

      //Build data URL if we have base64
      const pfp = profileImage?.base64
        ? `data:${profileImage.mime};base64,${profileImage.base64}`
        : undefined;

      await updateMe({
        firstname,
        lastname,
        email,
        dateofbirth,

        //only include password if the user actually changed it
        ...(form.password ? { password: form.password } : {}),
        ...(pfp ? { pfp } : {}),
      });

      alert("Information updated!"); //should change to toast 
    } catch (e) {
      const msg = e?.response?.data?.error || "Update failed";
      alert(msg);
    }
  };

  const handleLogout = () => {
    console.log("logout");
    logout()
    router.replace("/");
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
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
        >
          {/* Profile Picture */}
          <View style={styles.profilePicWrapper}>
            <View style={styles.profileCircle}>
              {profileImage ? (
                <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />
              ) : (
                <Ionicons name="person" size={60} color="white" />
              )}
            </View>
            {/* Edit icon for profile image */}
            <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
              <Ionicons name="pencil" size={18} color="white" />
            </TouchableOpacity>
          </View>

          {/* Form Inputs */}
          {[ 
            { key: "firstName", label: "First Name", placeholder: "Enter first name" },
            { key: "lastName", label: "Last Name", placeholder: "Enter last name" },
            { key: "dob", label: "Date of Birth", placeholder: "e.g. 01/01/2000" },
            { key: "email", label: "Email", placeholder: "Enter email" },
            { key: "password", label: "Password", placeholder: "Enter password", secure: true },
            { key: "fitnessGoal", label: "Fitness Goal", placeholder: "e.g. Lose weight" },
            { key: "fitnessLevel", label: "Fitness Level", placeholder: "Beginner/Intermediate/Advanced" },
            { key: "trainingDays", label: "Training Days", placeholder: "e.g. 3 days/week" },
            { key: "trainingTime", label: "Training Time", placeholder: "e.g. 1 hour/session" },
            { key: "diet", label: "Diet", placeholder: "e.g. Vegetarian" },
            { key: "height", label: "Height", placeholder: "e.g. 168 cm" },
            { key: "weight", label: "Weight", placeholder: "e.g. 60 kg" },
            { key: "waterGoal", label: "Water Intake Goal", placeholder: "e.g. 2L per day" },
            { key: "caloriesGoal", label: "Calories Intake Goal", placeholder: "e.g. 2000 kcal" },
          ].map((field) => (
            <View key={field.key} style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>
                {field.label}
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: "white", color: "black" }]}
                placeholder={field.placeholder}
                placeholderTextColor="#888"
                secureTextEntry={field.secure || false}
                value={form[field.key]}
                onChangeText={(text) => handleChange(field.key, text)}
              />
            </View>
          ))}

        {/* Logout button */}
        <View style={styles.logoutButtonWrapper}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.error }]}
            onPress={handleLogout}
          >
            <Text style={[styles.saveButtonText, { fontFamily: "Montserrat" }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>

          {/* Extra spacing to avoid save button overlap */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Sticky Save Button at the bottom */}
        <View style={styles.saveButtonWrapper}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.tint }]}
            onPress={handleSave}
          >
            <Text style={[styles.saveButtonText, { fontFamily: "Montserrat" }]}>
              Save Information
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 16,
    fontFamily: "Montserrat", 
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    fontFamily: "Montserrat", 
  },
  input: {
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    fontFamily: "Montserrat",
  },
  saveButtonWrapper: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },

  logoutButtonWrapper: {
    position: "absolute",
    bottom: 95,
    left: 20,
    right: 20,
  },

  saveButton: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },

  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "Montserrat", 
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:"center",
    marginVertical: 16,
    position: "relative",
  },
});
