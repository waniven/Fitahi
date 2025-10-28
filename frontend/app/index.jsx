import React, { useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
  useColorScheme,
  BackHandler,
} from "react-native";
import { Colors } from "../constants/Colors";
import FitahiLogo from "../constants/FitahiLogo";
import CustomButton from "../components/common/CustomButton";
import globalStyles from "../styles/globalStyles";
import GoogleSignInButton from "../components/auth/GoogleSignInButton";

/**
 * Main landing screen with animated logo and navigation to authentication flows
 * Features sequential animations and prevents back navigation on splash screen
 */
export default function Index() {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];
  const router = useRouter();

  // Animated values for coordinated entrance animations
  const svgFade = useRef(new Animated.Value(0)).current;
  const svgTranslateY = useRef(new Animated.Value(-20)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(20)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;

  // Orchestrates sequential entrance animations and disables back button
  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(svgFade, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(svgTranslateY, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(subtitleFade, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(subtitleTranslateY, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(buttonFade, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // Prevents hardware back button from exiting the splash screen
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Animated logo with fade-in and slide-down effect */}
      <Animated.View
        style={{
          opacity: svgFade,
          transform: [{ translateY: svgTranslateY }],
          marginBottom: 40,
        }}
      >
        <FitahiLogo width={320} height={140} fill="#FFFFFF" />
      </Animated.View>

      {/* Animated tagline with fade-in and slide-up effect */}
      <Animated.View
        style={{
          opacity: subtitleFade,
          transform: [{ translateY: subtitleTranslateY }],
          marginBottom: 50,
        }}
      >
        <Text style={[globalStyles.welcomeText, { color: theme.tint }]}>
          Your journey begins here.
        </Text>
      </Animated.View>

      {/* Animated authentication buttons with fade-in effect */}
      <Animated.View
        style={{ opacity: buttonFade, width: "100%", alignItems: "center" }}
      >
        <CustomButton
          title="Sign Up"
          onPress={() => router.push("/auth/Signup")}
          variant="primary"
          size="large"
          style={styles.button}
        />

        <CustomButton
          title="Log In"
          onPress={() => router.push("/auth/Login")}
          variant="primary"
          size="large"
          style={styles.button}
        />

        <GoogleSignInButton
        title="Sign In with Google"
        variant="priamry"
        size="large"
        rounded
        style={styles.button}
      />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  button: {
    width: "90%",
    marginBottom: 20,
    borderRadius: 30,
  },
});
