// app/login.jsx
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme
} from "react-native";
import { Colors } from "../../constants/Colors";
import globalStyles from "../../styles/globalStyles";

export default function Login() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = () => {
    if (!email || !password) {
      alert("Please fill in all fields.");
      return;
    }
    if (!validateEmail(email)) {
      alert("Please enter a valid email.");
      return;
    }
    router.replace("/home");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={[
            globalStyles.textBold,
            styles.title,
            { color: theme.textPrimary },
          ]}
        >
          Log In
        </Text>

        {/* Email Input */}
        <TextInput
          style={[styles.input, { borderColor: theme.tint, color: theme.textPrimary }]}
          placeholder="Email"
          placeholderTextColor={theme.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Password Input */}
        <TextInput
          style={[styles.input, { borderColor: theme.tint, color: theme.textPrimary }]}
          placeholder="Password"
          placeholderTextColor={theme.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.tint }]}
          onPress={handleLogin}
        >
          <Text
            style={[globalStyles.textBold, styles.buttonText, { color: theme.background }]}
          >
            Log In
          </Text>
        </TouchableOpacity>

        {/* Signup Link */}
        <TouchableOpacity onPress={() => router.replace("/signup")}>
          <Text
            style={[
              globalStyles.textRegular,
              styles.link,
              { color: theme.tint },
            ]}
          >
            Don't have an account? Sign Up
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 30,
  },
  title: {
    fontSize: 32,
    marginBottom: 36,
    textAlign: "center",
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#1c1c1c", // dark card feel
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
  },
  link: {
    textAlign: "center",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
