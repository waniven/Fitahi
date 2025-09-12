// components/navbar/BottomNav.jsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import globalStyles from "../../styles/globalStyles";

export default function BottomNav() {
  const theme = Colors["dark"];
  const router = useRouter();

  return (
    <View style={[styles.bottomNav, { backgroundColor: "#fff" }]}>
      <TouchableOpacity style={styles.navItem} onPress={() => router.push("/home")}>
        <Ionicons name="home-outline" size={26} color={theme.tint} />
        <Text style={[globalStyles.navText, { color: theme.tint }]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => router.push("/main/analytics")}>
        <Ionicons name="stats-chart-outline" size={26} color={theme.tint} />
        <Text style={[globalStyles.navText, { color: theme.tint }]}>Analytics</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => router.push("/main/supplements")}>
        <Ionicons name="medkit-outline" size={26} color={theme.tint} />
        <Text style={[globalStyles.navText, { color: theme.tint }]}>Supplements</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => router.push("/profile/AccountSettings")}>
        <Ionicons name="settings-outline" size={26} color={theme.tint} />
        <Text style={[globalStyles.navText, { color: theme.tint }]}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: "absolute",
    bottom: 0,
    width: "100%",
    pointerEvents: "box-none",
  },
  navItem: {
    alignItems: "center",
  },
});
