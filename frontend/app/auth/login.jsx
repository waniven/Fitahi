// app/auth/Login.jsx
import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import FitahiLogo from "../../constants/FitahiLogo";
import CustomInput from "../../components/common/CustomInput";
import CustomButton from "../../components/common/CustomButton";
import globalStyles from "../../styles/globalStyles"; 

export default function Login() {
  const router = useRouter();
  const theme = Colors["dark"];

  // Form state
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  
  // Error state ("Incorrect password/email")
 
  const [error, setError] = useState("");

  // Update form fields dynamically

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(""); // clear error while typing
  };


  // Handle login with validation

  const handleLogin = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email || !emailRegex.test(formData.email)) {
      setError("Please enter a valid email");
      return;
    }
    if (!formData.password) {
      setError("Incorrect email or Password");
      return;
    }

    // after login go to homepage
    router.push("/home");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 
            Logo
            */}
        <View style={styles.logoContainer}>
          <FitahiLogo width={260} height={100} fill="#FFFFFF" />
        </View>

        {/* 
            Welcome Text
             */}
        <Text style={[globalStyles.welcomeText, { color: "#00A2FF", fontSize: 28, textAlign: "center" }]}>
          Welcome back!
        </Text>
        <Text style={[globalStyles.cardText, { color: "#00A2FF", fontSize: 16, marginBottom: 30, textAlign: "center"}]}>
          Please log in with your email and password
        </Text>

        {/*
            Form Inputs
           */}
        <View style={styles.formContainer}>
          <CustomInput
            label="Email Address"
            placeholder="Email Address"
            value={formData.email}
            onChangeText={(text) => updateField("email", text)}
          />

          <CustomInput
            label="Password"
            placeholder="Password"
            value={formData.password}
            onChangeText={(text) => updateField("password", text)}
            secureTextEntry
          />

          {/* 
              Error message
              */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {/* Login Button*/}
        <View style={{ width: "100%", alignItems: "center", marginTop: 20 }}>
          <CustomButton
            title="Log In"
            onPress={handleLogin}
            size="large"
            style={{ width: 370, paddingVertical: 18, borderRadius: 30 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 80, 
    paddingBottom: 40,
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 30,
  },
  welcomeText: {
    textAlign: "center",
    marginBottom: 6,
    fontWeight: "700", 
  },
  subText: {
    textAlign: "center",
    marginBottom: 30,
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
  },
  errorText: {
    color: "#FF4D4D",
    fontSize: 14,
    marginTop: 10,
  },
});
