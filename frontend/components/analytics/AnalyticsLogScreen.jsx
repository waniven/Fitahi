// components/analytics/AnalyticsLogScreen.jsx
import React from "react";
import { View, Text, StyleSheet, StatusBar, Platform } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import CustomButtonThree from "../common/CustomButtonThree"; // Fixed path
import FloatingAIButton from "../../app/ai/FloatingAIButton";
import BottomNav from "../navbar/BottomNav";
import { Colors } from "../../constants/Colors";
import globalStyles from "../../styles/globalStyles";
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
  backgroundColor = Colors.dark.background,
  titleColor = Colors.dark.textPrimary,
  subtitleColor = Colors.dark.textPrimary,
}) => {
  const insets = useSafeAreaInsets();
  const topPad = Math.max(
    insets.top,
    Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0
  );

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />

      <View style={[globalStyles.container, { backgroundColor }, containerStyle]}>
        {/* Header section with optional back button and title */}
        <View style={[styles.header, { paddingTop: topPad - 30}]}>
          {showBackButton && (
            <View style={[styles.backButtonContainer, { top: topPad - 30 }]}>
              <CustomButtonThree onPress={onBackPress} />
            </View>
          )}

          {title && (
            <Text
              style={[
                styles.title,
                globalStyles.welcomeText,
                { color: titleColor, fontSize: 20, fontFamily: Font.semibold },
                titleStyle,
              ]}
            >
              {title}
            </Text>
          )}
        </View>

        {/* Main content area with custom content */}
        <View style={styles.content}>
          {children ? (
            children
          ) : (
            subtitle && (
              <Text
                style={[
                  styles.subtitle,
                  globalStyles.cardText,
                  { color: subtitleColor, fontSize: 24 },
                  subtitleStyle,
                ]}
              >
                {subtitle}
              </Text>
            )
          )}
        </View>
      </View>

      <BottomNav />
      <FloatingAIButton />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  backButtonContainer: {
    position: "absolute",
    left: 0,
    top: 40,
  },
  title: {
    fontSize: 20,
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 100,
  },
  subtitle: {
    fontSize: 25,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 30,
  },
});

export default AnalyticsLogScreen;