import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Keyboard, StyleSheet, TouchableOpacity, useColorScheme } from "react-native";
import { Colors } from "../../constants/Colors";
import AIassistant from "./AIassistant";
import AIChatbox from "./AIChatbox";

const { width, height } = Dimensions.get("window");

export default function FloatingAIButton() {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];
  const [chatVisible, setChatVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const position = useRef(new Animated.ValueXY({ x: width - 80, y: height - 140 })).current;

  // Adjust button when keyboard shows/hides
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => setKeyboardHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <>
      {/* Chatbox */}
      {chatVisible && <AIChatbox onClose={() => setChatVisible(false)} />}

      {/* Floating button: only show if chatbox is not visible */}
      {!chatVisible && (
        <Animated.View style={[styles.buttonWrapper, position.getLayout()]}>
          <TouchableOpacity
            onPress={() => setChatVisible(true)}
            activeOpacity={0.8}
            style={[styles.button, { backgroundColor: theme.tint }]}
          >
            <AIassistant size={40} color={theme.background} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: { position: "absolute", zIndex: 999 },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
