import { useContext } from "react";
import { TouchableOpacity, StyleSheet, Text } from "react-native";
import { AIContext } from "./AIContext";

export default function FloatingAIButton() {
  //access togglechat from context
  const { toggleChat } = useContext(AIContext);

  return (
    //tapple button
    <TouchableOpacity style={styles.fab} onPress={toggleChat} activeOpacity={0.8}>
      <Text style={styles.fabText}>💬</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",   //floats above other content
    bottom: 80,  //distance from bottom
    right: 24, // distance from the right edge
    backgroundColor: "#6761d7ff", 
    width: 64, // circular button
    height: 64, // circular button height
    borderRadius: 32, 
    justifyContent: "center",  //centers vertically
    alignItems: "center", //center horizontically 
    elevation: 6,
    zIndex: 9999, //stays above other Ui layout
  },
  fabText: {
    fontSize: 28,
    color: "white",
  },
});
