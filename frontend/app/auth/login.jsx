import React, { useState } from "react";
import {ScrollView, StyleSheet, Text, View, KeyboardAvoidingView, Platform,} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import FitahiLogo from "../../constants/FitahiLogo";
import CustomInput from "../../components/common/CustomInput";
import CustomButton from "../../components/common/CustomButton";
import globalStyles from "../../styles/globalStyles"; 

export default function Login() {
  const router = useRouter(); //navigation handler
  const theme = Colors["dark"];
 //for state
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(""); //error message for validation

  //update form field/clears error if present
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  //validation and navigation
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

    router.push("/home"); //navigate to home
  };

  return (
    //safeareview to prevent overlappting
    //keyboardavoiding to prevent inputs from being covered by keyboard
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // adjust as needed
      >
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <FitahiLogo width={260} height={100} fill="#FFFFFF" />
          </View>

          <Text style={[globalStyles.welcomeText, { color: "#00A2FF", fontSize: 28, textAlign: "center" }]}>
            Welcome back!
          </Text>
          <Text style={[globalStyles.cardText, { color: "#00A2FF", fontSize: 16, marginBottom: 30, textAlign: "center"}]}>
            Please log in with your email and password
          </Text>

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

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

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
    paddingBottom: 40,
    alignItems: "center",
  },
  logoContainer: { 
    marginBottom: 30 
  },
  welcomeText: { 
    textAlign: "center", 
    marginBottom: 6, 
    fontWeight: "700" 
  },
  subText: { 
    textAlign: "center", 
    marginBottom: 30 
  },
  formContainer: { 
    width: "100%", 
    alignItems: "center" 
  },
  errorText: { 
    color: "#FF4D4D", 
    fontSize: 14, 
    marginTop: 10 
  },
});
