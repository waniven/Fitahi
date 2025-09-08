// AI Chatbox
import { useEffect, useRef, useState } from "react";
import {Animated, Dimensions, FlatList, KeyboardAvoidingView, Keyboard, PanResponder, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal,} from "react-native";
import { Colors } from "../../constants/Colors";
import globalStyles from "../../styles/globalStyles"; 

const { height } = Dimensions.get("window");

export default function AIChatbox({ onClose }) {
  const scheme = "dark";
  const theme = Colors[scheme ?? "dark"];

  // State
  const [messages, setMessages] = useState([
    {
      id: "0",
      text: "Hey there! I'm Darwin. What can I assist you with today?",
      fromAI: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);

  // Animation for drag-down gesture
  const translateY = useRef(new Animated.Value(0)).current;

  // Ref for scrolling to end
  const flatListRef = useRef(null);

  // PanResponder for swipe down to close
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 0,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) translateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 150) {
          Animated.timing(translateY, {
            toValue: height,
            duration: 200,
            useNativeDriver: true,
          }).start(onClose); // Close the chatbox
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  /**
   * Sends user message and generates a placeholder AI response
   */
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now().toString(), text: input, fromAI: false };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        text: "Conversation coming soon.",
        fromAI: true,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
    }, 1000);
  };

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Scroll to bottom when keyboard appears
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
    return () => showSub.remove();
  }, []);

  /**
   * Renders individual chat bubbles
   */
  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        {
          alignSelf: item.fromAI ? "flex-start" : "flex-end",
          backgroundColor: item.fromAI ? theme.tint : theme.backgroundAlt,
        },
      ]}
    >
      <Text
        style={[
          { color: item.fromAI ? theme.background : theme.textPrimary },
          globalStyles.textRegular, 
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <>
      {/* Chatbox container with drag-down gesture */}
      <Animated.View
        style={[styles.container, { backgroundColor: theme.background, transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerText, globalStyles.textBold, { color: theme.tint }]}>
              Darwin
            </Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
              <Text style={[globalStyles.textBold, { color: "red", fontSize: 20 }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Messages list */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
          />

          {/* Loading indicator */}
          {loading && (
            <Text style={[globalStyles.textRegular, { color: theme.tint, margin: 8 }]}>
              Darwin is typing...
            </Text>
          )}

          {/* Input + buttons */}
          <View style={[styles.inputContainer, { paddingBottom: Platform.OS === "ios" ? 16 : 8 }]}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundAlt, color: theme.textPrimary }, globalStyles.textRegular]}
              placeholder="Type a message..."
              placeholderTextColor={theme.textSecondary}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={sendMessage}
            />

            {/* Past Conversations Button */}
            <TouchableOpacity style={styles.optionsButton} onPress={() => setHistoryVisible(true)}>
              <View style={styles.dotsContainer}>
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            </TouchableOpacity>

            {/* Send Button */}
            <TouchableOpacity style={[styles.sendButton, { backgroundColor: theme.tint }]} onPress={sendMessage}>
              <Text style={[globalStyles.textBold, { color: theme.background }]}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>

      {/* Past Conversations Modal */}
      <Modal visible={historyVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundAlt }]}>
            <Text style={[styles.modalTitle, globalStyles.textBold, { color: theme.textPrimary }]}>
              Past Conversations
            </Text>
            {/* past conversation need backend for sving*/}
            <TouchableOpacity style={styles.modalClose} onPress={() => setHistoryVisible(false)}>
              <Text style={[globalStyles.textBold, { color: "red" }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 80,
    left: 20,
    right: 20,
    bottom: 40,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerText: { 
    fontSize: 18, 
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
    maxWidth: "80%",
  },
  inputContainer: { 
    flexDirection: "row", 
    padding: 8 
  },
  input: { 
    flex: 1, 
    borderRadius: 20, 
    paddingHorizontal: 12, 
    height: 40 
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 16,
    marginLeft: 8,
  },
  optionsButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    marginRight: 8,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 14,
  },
  dot: { 
    width: 4,
    height: 4, 
    borderRadius: 2, 
    backgroundColor: "#fff" 
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: { 
    fontSize: 20, 
    marginBottom: 12 
  },
  modalClose: { 
    paddingVertical: 12, 
    alignItems: "center" 
  },
});
