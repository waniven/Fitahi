// profile/AccountSettings.jsx
import React, { useState } from "react";
import {StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView, Image,} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker"; 
import { useNavigation } from "@react-navigation/native";
import Toast from 'react-native-toast-message'; 

export default function AccountSettings() {
  const theme = Colors["dark"];
  const navigation = useNavigation();

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

  //validation error
  const [errors, setErrors] = useState({});

  // State for profile image
  const [profileImage, setProfileImage] = useState(null);

  // Handle input changes
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Validate inputs
  const validateForm = () => {
    let newErrors = {};

    if (!/^[A-Za-z]+$/.test(form.firstName.trim())) {
      newErrors.firstName = "First name must contain only letters.";  // first name must only contain letter no numbers etc
    }
    if (!/^[A-Za-z]+$/.test(form.lastName.trim())) {
      newErrors.lastName = "Last name must contain only letters.";  //last name only contains letters
    }
    if (!/^\d{2}[\/-]\d{2}[\/-]\d{4}$/.test(form.dob.trim())) {
      newErrors.dob = "Use DD/MM/YYYY format.";  //date format day/month/year
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "Invalid email format.";  //email must be valid
    }
    if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";  //password to be at least 6 characters
    }
    if (form.height && !/^\d+(\s?cm)?$/.test(form.height.trim())) {
      newErrors.height = "Height must be a number (e.g. 170 cm)."; //height in cm
    }
    if (form.weight && !/^\d+(\s?kg)?$/.test(form.weight.trim())) {
      newErrors.weight = "Weight must be a number (e.g. 65 kg).";  //weight in kgs
    }
    if (form.waterGoal && !/^\d+(\.\d+)?L$/i.test(form.waterGoal.trim())) {
      newErrors.waterGoal = "Water goal must be like '2L' or '2.5L'.";  //water in L
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  // Save form data (placeholder)
  const handleSave = () => {
    if(!validateForm()){
      // Show toast if validation fails
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fix the errors before saving.',
        position: 'top', //Show toast from the top
        visibilityTime: 5000, //disappears after 5 seconds
        autoHide: true,
      });
      return; //if requirements not met return error
    }

    console.log("Saved form data:", form);

    // Show success toast when info saved
    Toast.show({
      type: 'success',
      text1: 'Saved!',
      text2: 'Your information has been updated.',
      position: 'top', // Show toast from the top
      visibilityTime: 5000, // notification disappears after 5 seconds
      autoHide: true,
    });

  };

  // Pick profile image from gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

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
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
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
              {errors[field.key] && (
                <Text style={styles.errorText}>{errors[field.key]}</Text>
              )}
            </View>
          ))}

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

      {/* Toast for notifications */}
      <Toast /> 
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
  errorText: {
  color: "red",
  fontSize: 12,
  marginTop: 4,
  fontFamily: "Montserrat",
},
});
