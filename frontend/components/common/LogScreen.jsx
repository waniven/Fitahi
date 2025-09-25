// components/common/LogScreen.jsx
import React from "react";
import { View, Text, StyleSheet, StatusBar, Platform, useColorScheme } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import CustomButtonTwo from "./CustomButtonTwo";
import CustomButtonThree from "./CustomButtonThree";
import FloatingAIButton from "../../app/ai/FloatingAIButton";
import BottomNav from "../navbar/BottomNav";
import { Colors } from "../../constants/Colors";
import globalStyles from "../../styles/globalStyles";
import { Font } from "@/constants/Font";

/**
 * LogScreen - Reusable screen template with consistent layout and navigation
 * Provides standardized header, content area, and navigation components
 */
const LogScreen = ({
  title = "",
  subtitle = "",
  showBackButton = true,
  showAddButton = true,
  onBackPress = () => console.log("Back pressed"),
  onAddPress = () => console.log("Add pressed"),
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
        {/* Header section - positioned like CreateWorkout */}
        <View style={styles.header}>
          {showBackButton && (
            <View style={styles.backButtonContainer}>
              <CustomButtonThree onPress={onBackPress} />
            </View>
          )}

          {title && (
            <Text
              style={[
                styles.title,
                { color: textColor },
                titleStyle,
              ]}
            >
              {title}
            </Text>
          )}
        </View>

        {/* Main content area with default or custom content */}
        <View style={styles.mainContent}>
          {children ? (
            children
          ) : (
            <>
              {subtitle && (
                <Text
                  style={[
                    styles.subtitle,
                    { color: subColor },
                    subtitleStyle,
                  ]}
                >
                  {subtitle}
                </Text>
              )}

              {showAddButton && (
                <View style={styles.addButtonContainer}>
                  <CustomButtonTwo onPress={onAddPress} />
                </View>
              )}
            </>
          )}
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
    paddingTop: 12, // Match CreateWorkout padding
  },
  
  content: { 
    flex: 1, 
    paddingHorizontal: 16, // Match CreateWorkout inner padding
  },
  
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40, // Clean top padding like CreateWorkout
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
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100, // Space for bottom nav and FAB
  },
  
  subtitle: {
    fontSize: 25,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 30,
    fontFamily: Font.regular,
  },
  
  addButtonContainer: {
    marginTop: 0,
  },
});

export default LogScreen;