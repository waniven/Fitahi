// app/index.jsx
import React, { useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View, Animated, Easing, useColorScheme } from "react-native";
import { Colors } from "../constants/Colors";
import FitahiLogo from "../constants/FitahiLogo";
import CustomButton from "../components/common/CustomButton";
import globalStyles from "../styles/globalStyles";

export default function Index() {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];
  const router = useRouter();

  // Animated values for splash page

  const svgFade = useRef(new Animated.Value(0)).current;
  const svgTranslateY = useRef(new Animated.Value(-20)).current; // start slightly up
  const subtitleFade = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(20)).current; // start slightly down
  const buttonFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // animations: logo subtitle buttons
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
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/*  Logo with fade + slide down*/}
      <Animated.View
        style={{
          opacity: svgFade,
          transform: [{ translateY: svgTranslateY }],
          marginBottom: 40,
        }}
      >
        <FitahiLogo width={320} height={140} fill="#FFFFFF" />
      </Animated.View>

      {/* Subtitle with fade + slide up */}
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

      {/* Buttons with fade in */}
      <Animated.View
        style={{ opacity: buttonFade, width: "100%", alignItems: "center" }}
      >
        <CustomButton
          title="Sign Up"
          onPress={() => router.push("/auth/signup")}
          variant="primary"
          size="large"
          style={styles.button}
        />

        <CustomButton
          title="Log In"
          onPress={() => router.push("/auth/login")}
          variant="primary"
          size="large"
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
