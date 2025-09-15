import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import * as Progress from "react-native-progress";
import { Colors } from "@/constants/Colors";
import { Font } from "@/constants/Font";

export default function LoadingProgress({
  progress = 0,
  message = "Loading...",
}) {
  const theme = useColorScheme() === "dark" ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Progress.Bar progress={progress} width={200} color={theme.tint} />
      <Text style={[styles.text, { color: "#fff" }]}>
        {message} ({Math.round(progress * 100)}%)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  text: {
    marginTop: 12,
    fontFamily: Font.regular,
    fontSize: 16,
  },
});
