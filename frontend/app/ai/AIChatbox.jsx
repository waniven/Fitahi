import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, FlatList, KeyboardAvoidingView, Modal, PanResponder, Platform, StyleSheet, Text, TextInput, Pressable, View } from "react-native";
import { Colors } from "../../constants/Colors";
import { AILocal } from "../../constants/AILocal";
import { Font } from "../../constants/Font";

// screen height for dragging to close
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// constants for spacing
const CHAT_TOP = 80; // distance from top screen
const CHAT_SIDE = 20; // horizontal margin
const CHAT_BOTTOM = 40; // bottom margin / stays above nav bar
const INPUT_ROW_HEIGHT = 56;

export default function AIChatbox({ onClose, messages, setMessages }) {
  const scheme = "dark";
  const theme = Colors[scheme ?? "dark"];

  // Live chat starts empty on open
  const [chatMessages, setChatMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const flatListRef = useRef(null);

  // Drag-to-close using PanResponder
  const translateY = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 0, // respond to downward drags
      onPanResponderMove: (_, g) => { if (g.dy > 0) translateY.setValue(g.dy); },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 150) {
          // animate off screen and close
          Animated.timing(translateY, { toValue: SCREEN_HEIGHT, duration: 200, useNativeDriver: true })
            .start(() => onClose?.());
        } else {
          // return to original position
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  // auto-scroll down when new message gets sent
  useEffect(() => {
    if (chatMessages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [chatMessages]);

  // send message and simulate AI response
  const sendMessage = async (text) => {
    const clean = text?.trim();
    if (!clean) return;

    const userMsg = { id: Date.now().toString(), text: clean, fromAI: false };
    setChatMessages((prev) => [...prev, userMsg]);
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      await new Promise((r) => setTimeout(r, 350)); // simulate processing
      const aiText = await AILocal(clean); // local AI response
      const aiMsg = { id: (Date.now() + 1).toString(), text: aiText, fromAI: true };
      setChatMessages((prev) => [...prev, aiMsg]);
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      const errMsg = { id: Date.now().toString(), text: "Sorry I can't process your request right now. Please try again later", fromAI: true };
      setChatMessages((prev) => [...prev, errMsg]);
      setMessages((prev) => [...prev, errMsg]);
    } finally { setLoading(false); }
  };

  // render message bubble
  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        {
          alignSelf: item.fromAI ? "flex-start" : "flex-end",
          backgroundColor: item.fromAI ? theme.tint : "#007AFF",
        },
      ]}
    >
      <Text style={{ color: "#FFF", fontFamily: Font.regular, fontSize: 15, lineHeight: 20 }}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <Modal visible animationType="slide" transparent>
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.container, { backgroundColor: theme.background, transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={{ fontFamily: Font.bold, fontSize: 18, lineHeight: 22, color: theme.tint }}>Darwin</Text>
            <Pressable onPress={onClose} style={{ padding: 8 }}>
              <Text style={{ fontFamily: Font.bold, color: "red", fontSize: 20, lineHeight: 24  }}>✕</Text>
            </Pressable>
          </View>

          {/* Chat Messages */}
          <FlatList
            ref={flatListRef}
            data={chatMessages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 12, paddingBottom: INPUT_ROW_HEIGHT + 24 }}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onScroll={(e) => {
              const offsetY = e.nativeEvent.contentOffset.y;
              const contentHeight = e.nativeEvent.contentSize.height;
              const layoutHeight = e.nativeEvent.layoutMeasurement.height;
              const isAtBottom = offsetY + layoutHeight >= contentHeight - 50;
              setShowScrollDown(!isAtBottom);
            }}
            scrollEventThrottle={100}
          />

          {/* Scroll-to-bottom button */}
          {showScrollDown && (
            <Pressable
              style={[styles.scrollButton, { backgroundColor: theme.tint, zIndex: 999 }]} 
              onPress={() => flatListRef.current?.scrollToEnd({ animated: true })}
            >
              <Text style={{ fontFamily: Font.bold, color: theme.background, fontSize: 16, lineHeight: 20  }}>↓</Text>
            </Pressable>
          )}

          {/* Typing indicator */}
          {loading && (
            <Text style={{ fontFamily: Font.italic, color: theme.tint, marginHorizontal: 12, fontSize: 16, lineHeight: 20 }}>
              Darwin is typing...
            </Text>
          )}

          {/* Input Row */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            keyboardVerticalOffset={Platform.OS === "ios" ? CHAT_TOP : 20} 
          >
            <View style={[styles.inputBar, { backgroundColor: "#020114ff" }]}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundAlt,
                    color: "#FFF",
                    fontFamily: Font.regular,
                    fontSize: 15,
                    lineHeight: 20, 
                  },
                ]}
                placeholder="Type your message..."
                placeholderTextColor={theme.textSecondary}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={() => sendMessage(input)}
                returnKeyType="send"
                multiline
              />
              {/* History Button */}
              <Pressable style={[styles.iconBtn, { backgroundColor: theme.tint, zIndex: 10 }]} onPress={() => setHistoryVisible(true)}>
                <Text style={{ fontFamily: Font.bold, color: theme.background, fontSize: 18, lineHeight: 22 }}>≡</Text>
              </Pressable>
              {/* Send Button */}
              <Pressable style={[styles.sendButton, { backgroundColor: theme.tint, zIndex: 10 }]} onPress={() => sendMessage(input)}>
                <Text style={{ fontFamily: Font.bold, color: theme.background, fontSize: 15, lineHeight: 20  }}>Send</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>

      {/* Past Conversations */}
      <Modal visible={historyVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundAlt }]}>
            <Text style={{ fontFamily: Font.bold, color: theme.textPrimary, fontSize: 20, lineHeight: 24 , marginBottom: 12 }}>History</Text>
            <Pressable onPress={() => setHistoryVisible(false)} style={{ paddingVertical: 12, alignItems: "center" }}>
              <Text style={{ fontFamily: Font.bold, color: "red", fontSize: 16, lineHeight: 20  }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    paddingTop: CHAT_TOP,
    paddingBottom: CHAT_BOTTOM,
    paddingHorizontal: CHAT_SIDE,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
    maxWidth: "80%",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  input: {
    flex: 1,
    minHeight: 44, 
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8, 
    textAlignVertical: "center", 
  },
  iconBtn: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 44, 
    marginLeft: 8,
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 44,
    marginLeft: 8,
  },
  scrollButton: {
    position: "absolute",
    right: 16,
    bottom: INPUT_ROW_HEIGHT + 60,
    padding: 10,
    borderRadius: 20,
    elevation: 4,
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
});
