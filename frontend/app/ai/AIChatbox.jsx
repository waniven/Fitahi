import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { Colors } from "../../constants/Colors";
import * as messageService from "../../services/messageService";
import globalStyles from "../../styles/globalStyles";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const CHAT_TOP = 80;
const CHAT_SIDE = 20;
const CHAT_BOTTOM = 40;
const INPUT_ROW_HEIGHT = 56;

export default function AIChatbox({ onClose, messages, setMessages }) {
  const scheme = "dark";
  const theme = Colors[scheme ?? "dark"];

  const [chatMessages, setChatMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);

  const flatListRef = useRef(null);
  const typingController = useRef({ cancelled: false });

  const translateY = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 0,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 150) {
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onClose?.());
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (chatMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages]);

  const sendMessage = async (text) => {
    const clean = text?.trim();
    if (!clean) return;

    setInput("");
    setLoading(true);
    typingController.current = { cancelled: false };

    try {
      const { userMessage, aiMessage, conversationId } =
        await messageService.sendMessage(clean, activeConvo?._id);

      if (typingController.current.cancelled) {
        return; // stop if convo was deleted mid-reply
      }

      setActiveConvo({ ...activeConvo, _id: conversationId });

      const safeUserMsg = {
        ...userMessage,
        id: userMessage.id || Date.now().toString(),
      };
      const safeAiMsg = {
        ...aiMessage,
        id: aiMessage.id || (Date.now() + 1).toString(),
      };

      setChatMessages((prev) => [...prev, safeUserMsg, safeAiMsg]);
      setMessages((prev) => [...prev, safeUserMsg, safeAiMsg]);
    } catch (err) {
      let description = "Something went wrong. Please try again later.";
      if (err.response?.status === 500) {
        description =
          "Darwin is having issues or may be overloaded! Try again soon.";
      } else if (err.response?.status === 401) {
        description = "Your session expired (401). Please log in again.";
      } else if (err.message?.includes("Network")) {
        description = "No internet connection. Check your network and retry.";
      }

      Alert.alert("Darwin Unavailable", description);
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      const convos = await messageService.getConversations();
      setConversations(convos);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  useEffect(() => {
    if (historyVisible) loadConversations();
  }, [historyVisible]);

  const selectConversation = async (convo) => {
    setActiveConvo(convo);
    const msgs = await messageService.getMessagesByConversation(convo._id);
    setChatMessages(msgs);
    setMessages(msgs);
    setHistoryVisible(false);
  };

  const newConversation = async () => {
    const convo = await messageService.createConversation();
    setActiveConvo(convo);
    setChatMessages([]);
    setMessages([]);
    setHistoryVisible(false);
  };

  const deleteConversation = async (convoId) => {
    try {
      await messageService.deleteConversation(convoId);
      setConversations((prev) => prev.filter((c) => c._id !== convoId));

      if (activeConvo?._id === convoId) {
        typingController.current.cancelled = true;
        setActiveConvo(null);
        setChatMessages([]);
        setMessages([]);
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

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
      <Text style={[{ color: "#FFF" }, globalStyles.textRegular]}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <Modal visible animationType="slide" transparent>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            { backgroundColor: theme.background, transform: [{ translateY }] },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.header}>
            <Text
              style={[
                styles.headerText,
                globalStyles.textBold,
                { color: theme.tint },
              ]}
            >
              Darwin
            </Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
              <Text
                style={[globalStyles.textBold, { color: "red", fontSize: 20 }]}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            ref={flatListRef}
            data={chatMessages}
            keyExtractor={(item, index) => item.id ?? `msg-${index}`}
            renderItem={renderItem}
            contentContainerStyle={{
              padding: 12,
              paddingBottom: INPUT_ROW_HEIGHT + 24,
            }}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />

          {loading && (
            <Text
              style={[
                globalStyles.textRegular,
                { color: theme.tint, marginHorizontal: 12 },
              ]}
            >
              Darwin is typing...
            </Text>
          )}

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={CHAT_TOP}
          >
            <View style={[styles.inputBar, { backgroundColor: "#020114ff" }]}>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.backgroundAlt, color: "#FFF" },
                  globalStyles.textRegular,
                ]}
                placeholder="Type your message..."
                placeholderTextColor={theme.textSecondary}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={() => sendMessage(input)}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: theme.tint }]}
                onPress={() => setHistoryVisible(true)}
              >
                <Text
                  style={[
                    globalStyles.textBold,
                    { color: theme.background, fontSize: 18 },
                  ]}
                >
                  ≡
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: theme.tint }]}
                onPress={() => sendMessage(input)}
              >
                <Text
                  style={[globalStyles.textBold, { color: theme.background }]}
                >
                  Send
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>

      <Modal visible={historyVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundAlt },
            ]}
          >
            <Text
              style={[
                globalStyles.textBold,
                { fontSize: 20, marginBottom: 12, color: "#FFF" },
              ]}
            >
              History
            </Text>

            <TouchableOpacity
              onPress={newConversation}
              style={{ paddingVertical: 8 }}
            >
              <Text style={[globalStyles.textBold, { color: theme.tint }]}>
                + New Conversation
              </Text>
            </TouchableOpacity>

            {conversations.map((c, i) => (
              <View
                key={c._id ?? `convo-${i}`}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 8,
                }}
              >
                <TouchableOpacity
                  onPress={() => selectConversation(c)}
                  style={{ flex: 1 }}
                >
                  <Text style={{ color: theme.textPrimary }}>
                    {c.title || "Untitled"} -{" "}
                    {new Date(c.updatedAt).toLocaleString()}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteConversation(c._id)}>
                  <Text style={{ color: "red", fontSize: 16 }}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              onPress={() => setHistoryVisible(false)}
              style={{ paddingVertical: 12 }}
            >
              <Text style={[globalStyles.textBold, { color: "red" }]}>
                Close
              </Text>
            </TouchableOpacity>
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
  headerText: { fontSize: 18 },
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
  input: { flex: 1, height: 40, borderRadius: 20, paddingHorizontal: 12 },
  iconBtn: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 40,
    marginLeft: 8,
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: { borderRadius: 16, padding: 16 },
});
