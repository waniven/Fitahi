import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Font } from "@/constants/Font";

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  activeOpacity = 0.7,

  //floating behaviour
  floating = false,      // set true to anchor above nav
  extraBottom = 16,      // space above bottom
  tabBarHeight = 0,      // pass tab bar height if visible
  insetLR = 14,          // left/right insets for the floating bar
  containerStyle,        // extra styles for the floating container
}) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];
  const insets = useSafeAreaInsets();

  const isDisabled = disabled || loading;

  const Button = (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={activeOpacity}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        { backgroundColor: isDisabled ? theme.overlayLight ?? "#ccc" : theme.tint },
        style,
      ]}
    >
      {leftIcon}
      {loading ? (
        <ActivityIndicator color={theme.background} />
      ) : (
        <Text style={[styles.text, { color: theme.background }, textStyle]}>
          {title}
        </Text>
      )}
      {rightIcon}
    </TouchableOpacity>
  );

  if (!floating) return Button;

  const bottom = insets.bottom + tabBarHeight + extraBottom;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.floatingContainer,
        { left: insetLR, right: insetLR, bottom },
        containerStyle,
      ]}
    >
      {Button}
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: "absolute",
    alignItems: "center",
    zIndex: 9999,
    ...(Platform.OS === "android" ? { elevation: 10 } : {}),
  },
  button: {
    padding: 16,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 8,
   
  },
  text: {
    fontFamily: Font.bold,
    fontSize: 18,
  },
});
