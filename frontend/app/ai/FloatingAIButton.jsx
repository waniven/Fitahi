import { useContext } from "react";
import { TouchableOpacity, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AIContext } from "./AIContext";

/**
 * Floating action button that toggles the AI chatbox visibility
 * Positioned at bottom-right with safe area consideration for all devices
 */
export default function FloatingAIButton() {
  // Access chat toggle function from AI context
  const { toggleChat } = useContext(AIContext);
  
  // Get device safe area insets to avoid notches and home indicators
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      style={[styles.fab, { bottom: insets.bottom + 85 }]}
      onPress={toggleChat}
      activeOpacity={0.8}
    >
      <Text style={styles.fabText}>💬</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 24,
    backgroundColor: "#6761d7ff",
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10, // Android shadow and layering
    zIndex: 9999, // Ensures button stays above all other content
    shadowColor: "#000", // iOS shadow properties
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  fabText: {
    fontSize: 28,
    color: "white",
  },
});