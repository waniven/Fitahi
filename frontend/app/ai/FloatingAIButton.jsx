import { useContext } from "react";
import { TouchableOpacity, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AIContext } from "./AIContext";

export default function FloatingAIButton() {
  const { toggleChat } = useContext(AIContext);
  const insets = useSafeAreaInsets(); // get device safe area

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
    elevation: 10, // ensures Android layering
    zIndex: 9999, // stays on top
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  fabText: {
    fontSize: 28,
    color: "white",
  },
});
