import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Colors } from "../../constants/Colors";

const { height } = Dimensions.get("window");

export default function AIChatbox({ onClose }) {
  const scheme = "dark"; // black theme
  const theme = Colors[scheme ?? "light"];

  const [messages, setMessages] = useState([{ id: "0", text: "Hey there! I'm Darwin. What can I assist you with today?", fromAI: true }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const translateY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 0,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) translateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 150) {
          Animated.timing(translateY, { toValue: height, duration: 200, useNativeDriver: true }).start(onClose);
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), text: input, fromAI: false };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Mock AI response
    setTimeout(() => {
      const aiMsg = { id: (Date.now() + 1).toString(), text: "This is a sample Darwin response.", fromAI: true };
      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const renderItem = ({ item }) => (
    <View style={[styles.messageBubble, { alignSelf: item.fromAI ? "flex-start" : "flex-end", backgroundColor: item.fromAI ? theme.tint : theme.backgroundAlt }]}>
      <Text style={{ color: item.fromAI ? theme.background : theme.textPrimary }}>{item.text}</Text>
    </View>
  );

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: theme.background, transform: [{ translateY }] },
      ]}
      {...panResponder.panHandlers}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={[styles.headerText, { color: theme.tint }]}>Darwin</Text>
          <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
            <Text style={{ color: "red", fontWeight: "700", fontSize: 20 }}>✕</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
        />

        {loading && <Text style={{ color: theme.tint, margin: 8 }}>Darwin is typing...</Text>}

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundAlt, color: theme.textPrimary }]}
            placeholder="Type a message..."
            placeholderTextColor={theme.textSecondary}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity style={[styles.sendButton, { backgroundColor: theme.tint }]} onPress={sendMessage}>
            <Text style={{ color: theme.background, fontWeight: "700" }}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute", top: 100, left: 0, right: 0, bottom: 0, borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: "hidden" },
  header: { flexDirection: "row", justifyContent: "space-between", padding: 12, borderBottomWidth: 1, borderBottomColor: "#333" },
  headerText: { fontSize: 18, fontWeight: "700" },
  messageBubble: { padding: 12, borderRadius: 12, marginVertical: 4, maxWidth: "80%" },
  inputContainer: { flexDirection: "row", padding: 8 },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 12, height: 40 },
  sendButton: { justifyContent: "center", alignItems: "center", borderRadius: 20, paddingHorizontal: 16, marginLeft: 8 },
});
