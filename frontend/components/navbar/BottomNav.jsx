import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import globalStyles from "../../styles/globalStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// BottomNav - Fixed bottom navigation bar with 4 tabs, respecting safe area
export default function BottomNav() {
  const theme = Colors["dark"]; // use dark theme colors
  const router = useRouter(); // router for navigation
  const insets = useSafeAreaInsets(); // safe area for iPhone X / notch support

  // Main render
  return (
    <View
      style={[
        styles.bottomNav,
        {
          backgroundColor: "#fff",
          paddingBottom: 12 + insets.bottom, // add safe area padding
        },
      ]}
    >
      {/* Home Tab */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/home")}
      >
        <Ionicons name="home-outline" size={26} color={theme.tint} />
        <Text style={[globalStyles.navText, { color: theme.tint }]}>Home</Text>
      </TouchableOpacity>

      {/* Analytics Tab */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/main/analytics")}
      >
        <Ionicons name="stats-chart-outline" size={26} color={theme.tint} />
        <Text style={[globalStyles.navText, { color: theme.tint }]}>
          Analytics
        </Text>
      </TouchableOpacity>

      {/* Supplements Tab */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/main/supplements")}
      >
        <Ionicons name="medkit-outline" size={26} color={theme.tint} />
        <Text style={[globalStyles.navText, { color: theme.tint }]}>
          Supplements
        </Text>
      </TouchableOpacity>

      {/* Settings Tab */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/profile/AccountSettings")}
      >
        <Ionicons name="settings-outline" size={26} color={theme.tint} />
        <Text style={[globalStyles.navText, { color: theme.tint }]}>
          Settings
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // container for bottom nav
  bottomNav: {
    flexDirection: "row", // horizontal layout
    justifyContent: "space-around", // evenly spaced tabs
    borderTopLeftRadius: 20, // rounded corners
    borderTopRightRadius: 20,
    position: "absolute", // fixed at bottom
    bottom: 0,
    width: "100%",
    pointerEvents: "box-none", // allow touches to pass through gaps
    paddingTop: 12,
  },
  // individual nav item
  navItem: {
    alignItems: "center", // icon + text centered
  },
});
