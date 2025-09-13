import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import FitahiLogo from "../../constants/FitahiLogo";
import CustomInput from "../../components/common/CustomInput";
import CustomButton from "../../components/common/CustomButton";
import CustomToast from "../../components/common/CustomToast";
import globalStyles from "../../styles/globalStyles"; 

export default function Login() {
  const router = useRouter();
  const theme = Colors["dark"];
  
  // Form state
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);

  // Email validation function
  const validateEmail = (email) => {
    if (!email || !email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'Please enter a valid email address';
    return null;
  };

  // Password validation function
  const validatePassword = (password) => {
    if (!password || !password.trim()) return 'Password is required';
    return null;
  };

  // Update form field and clear errors if user has attempted login
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear specific field error if user has attempted login and field is now valid
    if (hasAttemptedLogin && errors[field]) {
      let fieldError = null;
      
      if (field === 'email') {
        fieldError = validateEmail(value);
      } else if (field === 'password') {
        fieldError = validatePassword(value);
      }
      
      if (!fieldError) {
        setErrors(prev => ({ ...prev, [field]: null }));
      }
    }
  };

  // Validate all form fields
  const validateForm = () => {
    const newErrors = {};
    
    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login with validation and toast notifications
  const handleLogin = () => {
    setHasAttemptedLogin(true);
    
    if (validateForm()) {
      // Success case
      CustomToast.success("Welcome Back!", "Login successful");
      router.push("/home");
    } else {
      // Show validation error toast
      if (errors.email && errors.password) {
        CustomToast.error("Login Failed", "Please check your email and password");
      } else if (errors.email) {
        CustomToast.error("Invalid Email", "Please enter a valid email address");
      } else if (errors.password) {
        CustomToast.error("Login Failed", "Password is required");
      } else {
        CustomToast.error("Login Failed", "Please check your credentials");
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
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
  container: { 
    flex: 1 
  },
  
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 80, 
    paddingBottom: 40,
    alignItems: "center",
  },
  
  logoContainer: { 
    marginBottom: 30 
  },
  
  formContainer: { 
    width: "100%", 
    alignItems: "center" 
  },
});