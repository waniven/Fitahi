// components/analytics/AnalyticsLogScreen.jsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  useColorScheme,
} from "react-native";
import CustomButtonThree from "../common/CustomButtonThree";
import FloatingAIButton from "../../app/ai/FloatingAIButton";
import BottomNav from "../navbar/BottomNav";
import { Colors } from "../../constants/Colors";
import { Font } from "@/constants/Font";

/**
 * AnalyticsLogScreen - Reusable screen template for analytics detail views
 * Provides standardized header, content area, and navigation components
 */
const AnalyticsLogScreen = ({
  title = "",
  subtitle = "",
  showBackButton = true,
  onBackPress = () => console.log("Back pressed"),
  children,
  containerStyle,
  titleStyle,
  subtitleStyle,
  backgroundColor,
  titleColor,
  subtitleColor,
}) => {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  // Use theme colors as defaults, allow override
  const bgColor = backgroundColor || theme.background;
  const textColor = titleColor || theme.textPrimary;
  const subColor = subtitleColor || theme.textPrimary;

  return (
    <View style={[styles.screen, { backgroundColor: bgColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={bgColor} />

      <View style={[styles.content, containerStyle]}>
        {/* Header section - positioned like LogScreen */}
        <View style={styles.header}>
          {showBackButton && (
            <View style={styles.backButtonContainer}>
              <CustomButtonThree onPress={onBackPress} />
            </View>
          )}

          {title && (
            <Text style={[styles.title, { color: textColor }, titleStyle]}>
              {title}
            </Text>
          )}
        </View>

        {/* Main content area */}
        <View style={styles.mainContent}>
          {subtitle && (
            <Text style={[styles.subtitle, { color: subColor }, subtitleStyle]}>
              {subtitle}
            </Text>
          )}
          {children}
        </View>
      </View>

      <BottomNav />
      <FloatingAIButton />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 12, // Match LogScreen padding
  },

  content: {
    flex: 1,
    paddingHorizontal: 16, // Match LogScreen inner padding
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40, // Clean top padding like LogScreen
    paddingBottom: 20,
    position: "relative",
  },

  backButtonContainer: {
    position: "absolute",
    left: 0,
    top: 40, // Aligned with header paddingTop
  },

  title: {
    fontSize: 24,
    fontFamily: Font.semibold,
    textAlign: "center",
  },

  mainContent: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 100, // Space for bottom nav and FAB
  },

  subtitle: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 30,
    fontFamily: Font.regular,
  },
});

export default AnalyticsLogScreen;
