// LoadingProgress - simple overlay with a progress bar and message
// Used to indicate loading or processing state, supports dynamic progress updates
import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import * as Progress from "react-native-progress"; // Progress bar library
import { Colors } from "@/constants/Colors";
import { Font } from "@/constants/Font";

export default function LoadingProgress({
  progress = 0, // progress value 0..1
  message = "Loading...", // text to display below progress bar
}) {
  const theme = useColorScheme() === "dark" ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Progress bar */}
      <Progress.Bar
        progress={progress}
        width={200} // fixed width
        color={theme.tint} // dynamic color based on theme
      />

      {/* Progress message */}
      <Text style={[styles.text, { color: "#fff" }]}>
        {message} ({Math.round(progress * 100)}%)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // center vertically
    alignItems: "center", // center horizontally
    position: "absolute", // overlay
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999, // on top of everything
  },
  text: {
    marginTop: 12, // spacing below progress bar
    fontFamily: Font.regular,
    fontSize: 16,
  },
});
